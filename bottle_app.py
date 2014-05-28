from theheadofabroom import Apps, micro_html


@Apps.Home()
def home(context, template):
    return template.render(context)


@Apps.Exploder()
def exploder(context, template):
    return template.render(context)


# noinspection PyUnusedLocal
@Apps.Message()
def message(context, template):
    Apps.redirect('/'.join((
        context['page']['url'],
        'Hello, World!',
        'Try changing the url, to see how it affects the page'
    )))


@Apps.Message(sub='/<msg>')
@Apps.Message(sub='/<msg>/<body:path>')
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
    Apps.statics('/static/', '<path:path>')


Apps.start()

