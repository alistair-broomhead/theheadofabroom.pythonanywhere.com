from os import path
from theheadofabroom import Site, Apps, micro_html

SITE = Site(root=path.abspath(__file__))
APPS = Apps(SITE)


@APPS.Home()
def home(context, template):
    return template.render(context)


@APPS.CV()
def cv(context, template):
    try:
        from xhtml2pdf import pisa
        from urllib import urlopen
        cv_url = "http://alistair-broomhead.github.io/cv/"
        out_filename = 'out.pdf'
        with open(out_filename, 'w+b') as out_file:
            with urlopen(cv_url) as cv:
                cv_string = cv.read()
            pisa.CreatePDF(cv_string, dest=out_file)
        print "produced pdf"
    finally:
        print context
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

if __name__ == '__main__':
    # For local debugging - on pythonanywhere.com
    # these are served outside of bottle
    APPS.statics('/static/', '<path:path>')
    APPS.start()