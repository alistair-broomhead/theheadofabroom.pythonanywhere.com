var ChalkAndCheese = (function(){

    var second, seconds, minute, minutes;
    second = seconds = 1000;
    minute = minutes = 60 * seconds;

    function Lobby(parent){
        var lobby = {
        };
        lobby.show = function(){
            $('#lobby')[0].style.visibility = 'visible';
            $('#table')[0].style.visibility = 'hidden';
            $('#join')[0].disabled = parent.context().ready;
        };
        lobby.join = function(){
            parent.ajax('/table', 'post', null, function(){
                lobby.show();
            })
        };
        return lobby;
    }
    function Table(parent){

        function Place(){
            var self = {};
            self.show = function(){
                $('#placement')[0].style.visibility =
                    $('#bidding')[0].style.visibility = 'visible';
                $('#raid')[0].style.visibility = 'hidden';
            };

            self.chalk = function (){
                parent.ajax('/token', 'post', '"chalk"');
            };

            self.cheese = function (){
                parent.ajax('/token', 'post', '"cheese"');
            };
            self.tick = function (){};
            return self;
        }

        function Bid(){
            var self = {};
            self.show = function(){
                $('#bidding')[0].style.visibility = 'visible';
                $('#placement')[0].style.visibility =
                    $('#raid')[0].style.visibility = 'hidden';
            };

            self.place = function (){
                var num = $('#bid-amt')[0].value;
                parent.ajax('/bid', 'post', num);
            };

            self.stand = function (){
                parent.ajax('/bid', 'delete');
            };
            self.tick = function (){};
            return self;
        }

        function Raid(){
            var self = {};
            self.show = function(){
                $('#raid')[0].style.visibility = 'visible';
                $('#placement')[0].style.visibility =
                    $('#bidding')[0].style.visibility = 'hidden';
            };

            self.take = function (){
                var num = $('#player')[0].value;
                parent.ajax('/token/'+num, 'get');
            };
            self.tick = function (){};
            return self;
        }

        var table = {
            place: undefined,
            bid: undefined,
            raid: undefined
        };
        table.show = function(){
            $('#table')[0].style.visibility = 'visible';
            $('#lobby')[0].style.visibility = 'hidden';
        };
        table.tick = function(state){
            if (state == "placement"){
                if (table.place == undefined){
                    table.bid = Bid();
                    table.place = Place();
                    table.raid = undefined;
                }
                table.place.tick();
            }
            else if (state == "bidding"){
                if (table.bid == undefined){
                    table.bid = Bid();
                    table.place = table.raid = undefined;
                }
                table.bid.tick();
            }
            else if (state == "raid"){
                if (table.raid == undefined){
                    table.raid = Raid();
                    table.place = table.bid = undefined;
                }
                table.raid.tick();
            }
            else if (state == "finished"){
                table.place = table.bid = table.raid = undefined;
                $('#placement')[0].style.visibility =
                    $('#bidding')[0].style.visibility =
                        $('#raid')[0].style.visibility = 'hidden';
            }
        };
        table.join = function(){
        };
        return table;
    }

    return {
        status: undefined,
        base: undefined,
        mouse: undefined,
        lobby: undefined,
        table: undefined,

        context: function(){
            return this.status[this.mouse.uid]
        },

        url: function (url){
            return this.base + url;
        },
        updateStatus: function(){
            var self = this;
            self.ajax('/mouse', 'get', null, function(data){
                self.status = data;
                $('#state')[0].innerHTML = '<pre>'+ JSON.stringify(data, null, " ") + '</pre>';
                if (data.state == "lobby"){
                    self.table = undefined;
                    if (self.lobby === undefined){
                        self.lobby = Lobby(self);
                        self.lobby.show();
                    }
                } else {
                    self.lobby = undefined;
                    if (self.table === undefined){
                        self.table = Table(self);
                        self.table.show();
                    }
                    self.table.tick(data.state);
                }
            }, null, function(){
                if (self.status.state != "finished"){
                    self.tick();
                }
            });
        },
        tick: function tick(){
            this.updateStatus();
        },
        auth: function auth(){
            return "Basic " + btoa(this.mouse.uid + ":" + this.mouse.password);
        },
        ajax: function ajax(url, method, data, success, failure, after){
            var self = this;
            $.ajax({
                url: self.base + url,
                type: method,
                data: data,
                dataType: 'json',
                headers: { "Authorization": self.auth() },
                success: success,
                error: failure,
                complete: after,
                trackMessageLength : true
            });
        },
        init: function(base){
            var self = this;
            self.base = base;
            $.ajax({
                async: false,
                url: self.url('/mouse'),
                type: 'POST',
                dataType: 'json',
                success: function(data){
                    self.mouse = data;
                    self.tick();
                },
                trackMessageLength : true
            });
        }
    };

})();

