from os import path
from json import load
from bottle import default_app, ResourceManager
from jinja2 import Environment, FileSystemLoader


class Site(object):

    def __init__(self, root):
        self.app_root = path.dirname(root)
        self.files = ResourceManager(base=root)
        self.files.add_path(path='static/')
        self.files.add_path(path='static/json/')

        self.environment = Environment(
            loader=FileSystemLoader(
                searchpath=path.join(self.app_root, 'template')))

    @property
    def _site_cfg(self):
        with self.files.open('site.json') as jsonfile:
            ret = load(jsonfile)
        self.environment.globals['site'] = ret
        return ret

    @property
    def apps(self):
        return self._site_cfg['apps']