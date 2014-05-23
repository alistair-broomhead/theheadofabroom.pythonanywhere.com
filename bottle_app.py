from bottle import default_app, route, redirect
from micro_html import HTML

@route('/')
def hello_world():
    document = HTML()
    with document.head.tag('title') as title:
        with document.body.tag('h1') as heading:
            heading.innerHTML = title.innerHTML = 'Welcome!'
    with document.body.tag('p') as paragraph:
        paragraph.add("There's not much here right now, but feel free to check "
                      "back later!")
    with document.body.tag('br'):
        pass
    with document.body.tag('h2') as heading:
        heading.innerHTML = 'Live projects'
    with document.body.tag('list') as projects:
        with projects.tag('li') as item:
            with item.tag('a', href='exploder') as link:
                link.innerHTML = 'Exploder - a JavaScript particle experiment'
        with projects.tag('li') as item:
            with item.tag('a', href='message/Hello/Hello, world') as link:
                link.innerHTML = 'Message - a simple test of a python HTML '\
                                 'micro-framework'
    return str(document)

@route('/message/<msg>')
def message(msg):
    redirect('/message/{0}/'.format(msg))

@route('/message/<msg>/<body:path>')
def message_with_body(msg, body):
    document = HTML()
    if msg:
        with document.head.tag('title') as title:
            title.innerHTML = msg
        with document.body.tag('h1') as heading:
            heading.innerHTML = msg
    if body:
        body = body.replace('/n', '<br/>')
        with document.body.tag('p') as paragraph:
            paragraph.innerHTML = body
    return str(document)

@route('/exploder')
def route_to_exploder():
    redirect('/exploder/')

application = default_app()

