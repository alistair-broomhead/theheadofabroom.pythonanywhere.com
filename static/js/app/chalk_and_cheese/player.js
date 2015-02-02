angular.module('cc-player', ['cc-utils'])
    .service('Player', ['Http', 'Tables', function(Http, Tables){
        var self = this;

        self.data = undefined;

        self.bind = function (Lobby){
            self.get(function(){
                self.poll();
                Lobby.bind();
            });
            return self;
        };

        self.get = function(done){
            var player = localStorage.getItem("cc-player");
            if (player === undefined){
                self.create(done)
            } else if (player === null){
                self.create(done)
            } else {
                player = self.data = JSON.parse(player);
                self.set(player);
                self.update(done, function(){
                    self.create(done);
                })
            }
        };
        self.poll = function(){
            Http.poll('/player/updated',
                function(data){
                    if (data.change){
                        self.set(data.data);
                    }
                }
            );
        };
        self.set = function(data){
            self.data = data;
            self.id = data.uid;
            Http.setAuth(data.uid, data.password);
            Tables.set(data.tables);
            var stored = JSON.stringify(data);
            localStorage.setItem("cc-player", stored);
        };
        self.create = function(done){
            Http.post('/player')
                .success(function(data){
                    self.set(data);
                    if (done !== undefined) done(self);
                });

        };
        self.update = function(done, err){
            Http.get('/player')
                .success(function(data){
                    self.set(data);
                    if (done !== undefined) done(self);
                })
                .error(function(){
                    if (err !== undefined) err(self);
                });
        };
        self.is = function(mouse){ return mouse.uid == self.id; };
        self.nameChange = function(){
            Http.put('/player', self.data)
                .success(function(data){
                    self.set(data);
                });
        };
    }]);