angular.module('cc-table', ['cc-utils'])
    .service('Tables', ['Table', 'TableMouse', function(Table, TableMouse){
        var self = this;
        self.indices = [];
        self.objects = {};

        self.bind = function(Player){
            TableMouse.prototype.Player = Player;
        };
        self.set = function(indices){
            var newIndices = [];
            var oldIndices = self.indices.slice();
            indices.forEach(function(index){
                if (oldIndices.indexOf(index) == -1){
                    newIndices.push(index);
                    self.objects[index] = new Table(index);
                } else {
                    oldIndices.splice(oldIndices.indexOf(index));
                }
            });
            oldIndices.forEach(function(index){
                delete self.objects[index];
            });
            self.indices = indices;
        };

    }])
    .factory('TableMouse', [function(){
        function TableMouse(table, id){
            this.id = id;
            this.$table = table;
            this.$cls = undefined;
            this.bid = undefined;

            var data = this.set(table.$data.mice[id]);

            this.is_player = this.Player.is(data);
        }

        TableMouse.prototype.set = function($data){
            this.$data = $data;
            if (this.$cls === undefined){
                this.$cls = this.Player.is($data)? "player": "mouse";
            }
            this.$is_turn = this.$table.$data.turn == this.id;
            this.cls = this.$cls + (this.$is_turn?" turn":"");

            if (this.name != $data.name) this.name = $data.name;
            if (this.points != $data.points) this.points = $data.points;
            if (this.hand != $data.hand) this.hand = $data.hand;
            if (this.stack != $data.stack) this.stack = $data.stack;

            if (this.$table.phase != "placement") this.bid = $data.bid;

            this.$can_bid = ((this.$table.phase == "placement" ||
                              this.$table.phase == "bidding") &&
                             this.stack.length > 0);


            return $data;
        };

        TableMouse.prototype.place = function(card){
            this.$table.place(card);
        };

        TableMouse.prototype.placeBid = function(){
            this.$table.placeBid(this.bid);
        };

        TableMouse.prototype.stand = function(){
            this.$table.stand();
        };

        return TableMouse;
    }])
    .factory('Table', ['Http', 'TableMouse', function(Http, TableMouse){
        function Table(id){
            this.id = id;
            this.$active = true;
            this.mice = {};
            this.phase = undefined;

            this.get();
        }

        Table.prototype.poll = function (){
            var self = this;
            Http.poll('/table/'+self.id+'/updated', function(data){
                if (!self.$active){
                    // deliberately crash polling for this Table
                    undefined();
                }
                if (data.change){
                    self.set(data.data);
                }
            });
        };

        Table.prototype.set = function(data){
            var self = this;
            self.$data = data;
            this.phase = data.state;

            for (var id in data.mice){
                if (data.mice.hasOwnProperty(id)){
                    if (self.mice.hasOwnProperty(id)){
                        self.mice[id].set(data.mice[id]);
                    } else {
                        self.mice[id] = new TableMouse(self, id);
                    }
                }
            }
        };
        Table.prototype.get = function(){
            var self = this;
            Http.get('/table/'+self.id)
                .success(function(data){
                    self.set(data);
                }).then(function(){
                    self.poll();
                })
        };
        Table.prototype.place = function(card){
            var self = this;
            Http.post('/table/'+this.id+'/token', card)
                .success(function(){
                    self.get();
                }).then(function(){
                    self.poll();
                })
        };

        Table.prototype.placeBid = function(amt){
            var self = this;
            Http.post('/table/'+this.id+'/bid', amt)
                .success(function(){
                    self.get();
                }).then(function(){
                    self.poll();
                })
        };

        Table.prototype.stand = function(){
            var self = this;
            Http.delete('/table/'+this.id+'/bid')
                .success(function(){
                    self.get();
                }).then(function(){
                    self.poll();
                })
        };

        return Table;
    }])
    .directive('ccTableTab', ['Tables', function(Tables){
        return {
            restrict: 'E',
            replace: true,
            scope: {
                index: '='
            },
            link: function($scope){
                $scope.tables = Tables;
                $scope.table = Tables.objects[$scope.index];
            },
            template:
                '<div id="table-{{index}}" class="tab table-tab">' +
                    '<a href="#table-{{index}}">Table [{{index}}]</a>' +
                    '<div class="view cc-table" ng-model="table">' +
                        '<h1> Phase: {{table.phase}} </h1><hr>' +
                        '<cc-table-mouse mouse="mouse" ' +
                    'ng-repeat="(_id, mouse) in table.mice"></cc-table-mouse>'
                       + '<pre>{{table | json}}</pre>' +
                    '</div>' +
                '</div>'
        };
    }])
    .directive('ccTableMouse', [function(){
        return {
            restrict: 'E',
            replace: true,
            scope: {
                mouse: '='
            },
            template:
                '<div ng-model="mouse">' +
                    '<cc-table-player mouse="mouse"></cc-table-player>' +
                    '<cc-table-other mouse="mouse"></cc-table-other>' +
                    '<hr>' +
                '</div>'
        };
    }])
    .directive('ccUnknownCard', function(){
        return {
            restrict: 'E',
            replace: true,
            scope: {
                take: '=',
                disabled: '='
            },
            template:
                '<button ng-click="take()" ng-disable="disabled">' +
                    '?' +
                '</button>'
        };
    })
    .directive('ccTableOther', function(){
        return {
            restrict: 'E',
            replace: true,
            scope: {
                mouse: '='
            },
            link: function($scope){
                $scope.hand = new Array($scope.mouse.hand);
                $scope.stack = new Array($scope.mouse.stack);

                $scope.disabled = function($last){
                    // You can only grab the top card in the raid phase
                    // when you have exhausted you own stack

                    if (!$last) return true;

                    var table = $scope.mouse.$table;

                    if (table.phase != "raid") return true;

                    var player = table.mice[table.turn];

                    return player.stack.length > 0;
                };
            },
            template:
                '<div class="{{mouse.cls}}" ng-if="!mouse.is_player">' +
                    '<span class="name"> [{{mouse.id}}] {{mouse.name}}: </span>' +
                    '<span> Points: {{mouse.points}} </span> | ' +
                    '<span> Hand: ' +
                        '<cc-unknown-card ng-repeat="i in hand track by $index"' +
                                        ' disabled="true"></cc-unknown-card>' +
                    ' </span> | ' +
                    '<span> Stack: ' +
                        '<cc-unknown-card ng-repeat="i in stack track by $index"' +
                            ' disabled="disabled($last)"></cc-unknown-card>' +
                    ' </span>' +
                    '<span ng-if="mouse.bid > 0"> | Bid: {{mouse.bid}} cheese </span>' +
                '</div>'
        };
    })
    .directive('ccTablePlayer', function(){
        return {
            restrict: 'E',
            replace: true,
            scope: {
                mouse: '='
            },
            link: function($scope){
                var mouse = $scope.mouse;
                var table = $scope.mouse.$table;

                $scope.isRaid = (table.phase == "raid");

                $scope.canPlace = (mouse.$is_turn && table.phase == "placement");
                $scope.bid = function(){
                    mouse.placeBid();
                };
                $scope.stand = function(){
                    mouse.stand();
                };
                $scope.wonBid = mouse.$is_turn && (
                    table.phase == "raid" || table.phase == "finished");
            },
            template:
                '<div class="{{mouse.cls}}" ng-if="mouse.is_player">' +
                    '<div class="name"> [{{mouse.id}}] {{mouse.name}}: </div>' +
                    '<div> Points: {{mouse.points}} </div>' +
                    '<div>' +
                        'Hand: ' +
                        '<cc-table-card mouse="mouse" card="card"' +
                                      ' ng-repeat="card in mouse.hand track by $index"' +
                                      ' enabled="canPlace"></cc-table-card>'+
                    '</div>' +
                    '<div>' +
                        'Stack:' +
                        '<cc-table-card mouse="mouse" card="card"' +
                                      ' ng-repeat="card in mouse.stack track by $index"' +
                                      ' enabled="$last && isRaid"></cc-table-card>'+
                    '</div>' +
                    '<div ng-if="mouse.$can_bid">' +
                        '<input type="number" value="{{mouse.bid}}" ng-model="mouse.bid"/>' +
                        '<button ng-disabled="!(mouse.$can_bid && mouse.$is_turn)" ng-click="bid()"> Bid! </button>' +
                        '<button ng-disabled="!(mouse.$can_bid && mouse.$is_turn)" ng-click="stand()"> Stand! </button>' +
                    '</div>'+
                    '<div ng-if="wonBid"> Won Bid: {{mouse.bid}} </div>'+
                '</div>'
        };
    })
    .directive('ccTableCard', function(){
        return {
            restrict: 'E',
            replace: true,
            scope: {
                mouse: '=',
                card: '=',
                enabled: '='
            },
            link: function($scope){
                $scope.place = function(){
                    $scope.mouse.place($scope.card);
                };
            },
            template:
                '<span>' +
                    '<button ng-click="place()" ng-disabled="!enabled">' +
                        '{{card}}' +
                    '</button>' +
                '</span>'
        };
    });