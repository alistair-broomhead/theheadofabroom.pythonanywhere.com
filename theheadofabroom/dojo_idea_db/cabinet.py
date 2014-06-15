import shelve
from threading import Lock
from os import path, mkdir


class Cabinet(object):
    """
    Cabinet is a class which is intended to hold all the shelves, which are
    context-managed.
    """

    class LockingShelfContext(object):

        _shelf_dir = path.join(path.dirname(path.abspath(__file__)), "shelves")

        def __init__(self, name):
            self.name = name
            filename = path.join(self._shelf_dir,  "{0}.shelf".format(name))
            if not path.exists(self._shelf_dir):
                mkdir(self._shelf_dir)
            self._shelf = shelve.open(filename)
            self.shelf = None
            self._lock = Lock()

        def __enter__(self):
            #self._lock.acquire()
            self.shelf = {key: value for key, value in self._shelf.items()}
            return self.shelf

        # noinspection PyUnusedLocal
        def __exit__(self, exc_type, exc_val, exc_tb):
            #self._lock.release()
            self._shelf.update(self.shelf)
            self._shelf.sync()
            self.shelf = None

    ideas = LockingShelfContext("ideas")