from gevent.monkey import patch_all
patch_all()
from bottle import static_file, redirect, run, route, response

from theheadofabroom.framework.app import App


class Apps(object):
    """
    Apps is a micro-framework built around bottle.

    It takes a Site object which manages resources, and creates an App object
    for each app entry in the site config json file. By default each app will
    have a default route - a GET operation on the given url will render the
    given template.

    Each app will expose its route method be an attribute of the Apps instance
    by its given name, and can be used to replace and/or extend the resources
    offered by that app.
    """

    def __iter__(self):
        for k in self._apps:
            yield k

    def __getattr__(self, item):
        return self._apps[item].route

    def _set_default_app_routes(self):

        def default(context, template):
            if template is None:
                return context
            try:
                return template.render(context)
            except BaseException as ex:
                response.status = 500
                return '<br><br>'.join((
                    str(ex),
                    str(context)
                ))

        for app in self._apps.values():
            app.route()(default)

    def __init__(self, site):
        self.site = site
        self._apps = {
            name: App(site=self.site, name=name, **app)
            for name, app in site.apps.items()
        }
        self._set_default_app_routes()

    @staticmethod
    def start(*args, **kwargs):
        import os
        kwargs.setdefault('port', int(os.environ.get("PORT", 5000)))
        kwargs.setdefault('host', '0.0.0.0')
        run(*args, reloader=True, server='gevent', **kwargs)

    def statics(self, root, path_spec):
        @route(root+path_spec)
        def serve_statics(path):
            filename = self.site.files.lookup(path)
            return static_file(filename, '')
        return serve_statics

    @staticmethod
    def redirect(url, code=None):
        return redirect(url, code)