from app import App
from bottle import static_file, redirect, run, route


class Apps(object):

    def __iter__(self):
        for k in self._apps:
            yield k

    def __getattr__(self, item):
        return self._apps[item].route

    def __init__(self, site):
        self.site = site
        self._apps = {app['name']: App(site=self.site, **app) for app in site.apps}

    @staticmethod
    def start(*args, **kwargs):
        run(*args, reloader=True, **kwargs)

    def statics(self, root, path_spec):
        @route(root+path_spec)
        def serve_statics(path):
            return static_file(self.site.files.lookup(path), '.')
        return serve_statics

    @staticmethod
    def redirect(url, code=None):
        return redirect(url, code)