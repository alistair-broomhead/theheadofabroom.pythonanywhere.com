from os import path
from theheadofabroom import Site, Apps, micro_html

SITE = Site(root=path.abspath(__file__))
APPS = Apps(SITE)


@APPS.Home()
def home(context, template):
    return template.render(context)


@APPS.Exploder()
def exploder(context, template):
    return template.render(context)


# noinspection PyUnusedLocal
@APPS.Message()
def message(context, template):
    APPS.redirect()


@APPS.Message(sub='/<msg>')
@APPS.Message(sub='/<msg>/<body:path>')
def message(context, template, msg, body=''):
    document = micro_html.HTML()
    if msg:
        with document.head.tag('title') as title:
            title.inner_html = msg
        with document.body.tag('h1') as heading:
            heading.inner_html = msg
    if body:
        body = body.replace('/n', '<br/>')
        with document.body.tag('p') as paragraph:
            paragraph.inner_html = body
    context['document'] = str(document)
    return template.render(context)

if False:
    # For local debugging - on pythonanywhere.com
    # these are served outside of bottle
    APPS.statics('/static/', '<path:path>')


APPS.start()

