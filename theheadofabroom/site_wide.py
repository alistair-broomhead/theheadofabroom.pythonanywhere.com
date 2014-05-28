from os import path
from json import load
from bottle import ResourceManager
from jinja2 import Environment, FileSystemLoader


class Site(object):
    app_root = path.abspath(path.dirname(path.dirname(__file__)))
    files = ResourceManager(base=app_root+'/')
    files.add_path(path='static/')
    files.add_path(path='static/json/')

    _site_cfg = load(files.open('site.json'))

    apps = _site_cfg['apps']

    environment = Environment(
        loader=FileSystemLoader(
            searchpath=path.join(app_root, 'template')))
    environment.globals['site'] = _site_cfg