from functools import wraps
from jinja2 import TemplateNotFound
from bottle import route


class App(object):
    def __init__(self, name, url, template, site, **kwargs):
        self.name = name
        self.url = url
        self.site = site
        try:
            self.template = site.environment.get_template(template)
        except (TemplateNotFound, AttributeError):
            self.template = None
        self._context = {
            'app': site.apps[name]
        }

    @property
    def context(self):
        context = {
            'page': {
                'name': self.name,
                'url': self.url
            }
        }
        for k, v in self._context.items():
            if k in context:
                context[k].update(v)
            else:
                context[k] = v
        return context

    def add_context(self, **kwargs):
        for k, v in kwargs.items():
            self._context[k] = v

    def route(self, sub=None, *args, **kwargs):
        url = self.url
        if sub is not None:
            url += sub

        def bind_decorator(fn):
            @route(url, *args, **kwargs)
            @wraps(fn)
            def inner(*fn_args, **fn_kwargs):
                fn_kwargs['template'] = self.template
                fn_kwargs['context'] = self.context
                return fn(*fn_args, **fn_kwargs)
            return inner

        return bind_decorator