from contextlib import contextmanager


class Tag(object):

    _indent = ' '*4
    _single = '{0.indent}<{0.open}/>\n'
    _open = '{0.indent}<{0.open}>\n'
    _close = '{0.indent}</{0.name}>\n'

    def __init__(self, tag_name, indent='', **kwargs):
        self.name = tag_name
        self.properties = kwargs.copy()
        self.raw = []
        self.indent = indent

    @property
    def open(self):
        return ' '.join([self.name] + ['='.join([str(key), repr(value)])
                                       for (key, value)
                                       in self.properties.items()])

    @contextmanager
    def tag(self, tag_name, **kwargs):
        new_sub = Tag(tag_name, self.indent + self._indent, **kwargs)
        self.raw.append(new_sub)
        yield new_sub

    def small_tag(self, tag_name, **kwargs):
        return Tag(tag_name, self.indent + self._indent, **kwargs)

    @property
    def innerHTML(self):
        return ''.join(str(x) for x in self.raw)

    @innerHTML.setter
    def innerHTML(self, value):
        value = str(value)
        if value [0] != ' ':
            value = self.indent + self._indent + value
        if value[-1] != '\n':
            value += '\n'
        self.raw = [value]

    def add(self, value):
        value = str(value)
        if value [0] != ' ':
            value = self.indent + self._indent + value
        if value[-1] != '\n':
            value += '\n'
        self.raw.append(value)

    def __str__(self):
        if self.raw:
            return ''.join([self._open.format(self),
                            self.innerHTML,
                            self._close.format(self)])
        else:
            return self._single.format(self)



class HTML(object):
    def __init__(self):
        self.head = Tag('head')
        self.body = Tag('body')

    def __str__(self):
        return str(self.head) + str(self.body)