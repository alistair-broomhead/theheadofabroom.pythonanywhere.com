from ..framework import micro_html


class Message(object):
    def __init__(self, apps):
        self.apps = apps

    def connect(self, app):
        app()(self.message_root)
        app(sub='/<msg>')(self.message)
        app(sub='/<msg>/<body:path>')(self.message)

    # noinspection PyUnusedLocal
    def message_root(self, context, template):
        self.apps.redirect('/'.join((
            context['page']['url'],
            'Hello, World!',
            'Try changing the url, to see how it affects the page'
        )))

    @staticmethod
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