from app import App
from site_wide import Site
from abc import ABCMeta
from bottle import Bottle, static_file, redirect


class AppsMeta(ABCMeta):

    def __iter__(cls):
        for k in cls._apps:
            yield k

    def __getattr__(cls, item):
        return cls._apps[item].route

    def __init__(cls, name, bases, dct):
        super(AppsMeta, cls).__init__(name, bases, dct)
        cls._server = Bottle()
        cls._apps = {app['name']: App(server=cls._server, **app) for app in Site.apps}

    def start(cls):
        cls._server.run()

    def statics(cls, root, path_spec):
        @cls._server.route(root+path_spec)
        def serve_statics(path):
            return static_file(Site.files.lookup(path), '.')
        return serve_statics

    def redirect(cls, url, code=None):
        return redirect(url, code)


class Apps(object):
    __metaclass__ = AppsMeta