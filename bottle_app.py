from os import path
from theheadofabroom.framework import Site, Apps
from theheadofabroom.apps import message


def render_with_added(**add_context):
    def inner(template, context):
        for k, v in add_context.items():
            context[k] = v
        return template.render(context)
    return inner


def main():
    site = Site(root=path.abspath(__file__))
    apps = Apps(site)

    message.Message(apps).connect(apps.Message)

    return apps

APPS = main()
if __name__ == '__main__':
    # For local debugging - on pythonanywhere.com
    # these are served outside of bottle
    APPS.statics('/static/', '<path:path>')
    APPS.start()