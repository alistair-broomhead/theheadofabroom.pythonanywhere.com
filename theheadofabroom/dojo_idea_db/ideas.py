from sqlite3 import Date
from .cabinet import Cabinet
from cork import Cork


class Status(object):
    NEW = "new"
    RENEWED = "renewed"
    VOTED = "voted"

    ENCOURAGED = "encouraged"
    NEUTRAL = "neutral"
    SUPPRESSED = "suppressed"

    DONE = "done"

    weight = {
        NEW: 1,
        RENEWED: 2,
        VOTED: 3,

        ENCOURAGED: 0,
        NEUTRAL: 4,
        SUPPRESSED: 8,

        DONE: 16
    }


class Idea(object):
    def __init__(self, name, parent):
        """
        :param name: str
        :param parent: Ideas
        """
        self.name = name
        self.parent = parent

    def __getitem__(self, key):
        if key == "votes_adjusted":
            # votes have a half-life of 4 weeks
            d = self.to_dict
            votes = d["votes"]
            if votes == 0:
                return 0
            weeks = (d["voted"] - Date.today()).days / 7.0
            if weeks == 0:
                return votes
            return votes * (2 ** (-1 * weeks / 4))
        with self.parent.ideas as ideas:
            return ideas[self.name][key]

    def __setitem__(self, key, value):
        if self.parent.ideas.shelf is not None:
            self.parent.ideas.shelf[self.name][key] = value
        else:
            with self.parent.ideas as ideas:
                ideas[self.name][key] = value

    @property
    def exists(self):
        with self.parent.ideas as ideas:
            return self.name in ideas

    @property
    def to_dict(self):
        """ :return : dict """
        with self.parent.ideas as ideas:
            return ideas[self.name].copy()

    def update(self, mapping):
        with self.parent.ideas as ideas:
            ideas[self.name].update(mapping)

    def add(self, description):
        with self.parent.ideas as ideas:
            new_idea = {
                "name": self.name,
                "description": description,
            }
            if self.name in ideas.keys():
                new_idea.update({
                    "status": Status.RENEWED,
                    "renewed": Date.today()
                })
                self.update(new_idea)
            else:
                new_idea.update({
                    "status": Status.NEW,
                    "moderation": Status.NEUTRAL,
                    "suggested": Date.today()
                })
                ideas[self.name] = new_idea

    def require_admin(self):
        self.parent.auth.require(role="admin")

    def vote(self, votes):
        self.require_admin()
        if self["status"] == Status.NEW:
            self["status"] = Status.VOTED
        self["votes"] = int(votes)
        self["voted"] = Date.today()

    def encourage(self):
        self.require_admin()
        self["moderation"] = Status.ENCOURAGED

    def suppress(self):
        self.require_admin()
        self["moderation"] = Status.SUPPRESSED

    def done(self, source):
        self.require_admin()
        self.update({
            "status": Status.DONE,
            "source": source,
            "done": Date.today()
        })


class Ideas(object):
    def __init__(self, context, template):
        self.cabinet = Cabinet()
        self.ideas = self.cabinet.ideas
        self.auth = Cork()
        self.context = context
        self.template = template

    def render(self, template=None):
        if template is None:
            template = self.template
        return template.render(self.context)

    def redirect(self, apps, url=None, code=None):
        """
        :type apps: Apps
        """
        apps.redirect(self.sub_url(url), code)

    def sub_url(self, url=None):
        root = self.context['page']['url']
        if url is None:
            return root
        else:
            return '/'.join(root.rstrip('/'), url.lstrip('/'))

    def require_role(self, role):
        message = 'You do not have role {0:r}'.format(role)
        self.auth.require(role=role,
                          fail_redirect=self.sub_url('login?error={0}'
                                                     .format(message)))

    def new_from_request(self, request):
        self.add(name=request.forms.get('name'),
                 description=request.forms.get('description'))
        return self

    def list_all(self):
        self.context["ideas"] = [(name, self[name]["description"])
                                 for name in self]
        return self

    def add(self, name, description='No description'):
        self.require_role('user')
        Idea(name=name, parent=self).add(description)

    def __getitem__(self, name):
        idea = Idea(name=name, parent=self)
        if not idea.exists:
            raise KeyError("{0} is not in the database".format(name))
        return idea

    def __setitem__(self, name, mapping):
        idea = Idea(name=name, parent=self)
        if not idea.exists:
            self.add(name=name)
        self[name].update(mapping)

    _cmp_key_lookup = {
        Status.NEW: "suggested",
        Status.RENEWED: "renewed",
        Status.VOTED: "votes_adjusted",
        Status.DONE: "done"
    }

    def __iter__(self):
        with self.ideas as ideas:
            keys = ideas.keys()
        ranked = {}
        for name in keys:
            idea = self[name]
            d = idea.to_dict
            rank = Status.weight[d["status"]] + Status.weight[d["moderation"]]
            if rank not in ranked:
                ranked[rank] = {
                    "ideas": [],
                    "key": self._cmp_key_lookup[d["status"]]
                }
            ranked[rank]["ideas"].append(idea)

        for rank in sorted(ranked.keys()):
            for idea in sorted(ranked[rank]["ideas"],
                               key=lambda d: d[ranked[rank]["key"]],
                               reverse=True):
                yield idea.name