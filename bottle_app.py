from os import path
from theheadofabroom import Site, Apps, micro_html
from theheadofabroom.dojo_idea_db.ideas import Ideas
from bottle import request

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
    APPS.redirect('/'.join((
        context['page']['url'],
        'Hello, World!',
        'Try changing the url, to see how it affects the page'
    )))


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

@APPS.Dojo_Ideas_Database()
def dojo_ideas_main(context, template):
    return Ideas(context, template).list_all().render()

@APPS.Dojo_Ideas_Database(sub="/new", method='POST')
def new_idea(context, template):
    Ideas(context, template).new_from_request(request).redirect(APPS)

@APPS.Dojo_Ideas_Database(sub="/edit")
def edit_idea(context, template):
    ideas = Ideas(context, template)
    ideas.require_role('admin')
    ideas.redirect(APPS)

if __name__ == '__main__':
    # For local debugging - on pythonanywhere.com
    # these are served outside of bottle
    APPS.statics('/static/', '<path:path>')
    APPS.start()