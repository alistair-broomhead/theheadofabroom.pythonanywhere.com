angular.module('cc-table', ['cc-utils'])
    .service('Tables', ['Table', function(Table){
        var self = this;
        self.indices = [];
        self.objects = {};

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
    .factory('Table', ['Http', function(Http){
        return function(id){

            var self = {
                active: true
            };
            self.poll = function (){
                Http.poll('/table/'+id+'/updated', function(data){
                    if (data.change) self.set(data.data);
                });
            };

            self.set = function(data){
                self.data = data;
            };
            self.get = function(){
                Http.get('/table/'+id)
                    .success(function(data){
                        self.set(data);
                    }).then(function(){
                        self.poll();
                    })
            };

            self.get();

            return self
        };
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
                        '<div>{{table}}</div><br>' +
                        '<cc-table-mouse ng-repeat="(_id, mouse) in table.data.mice">' +
                        '</cc-table-mouse>' +
                    '</div>' +
                '</div>'
        };
    }])
    .directive('ccTableMouse', ['Player', function(Player){
        return {
            restrict: 'E',
            replace: true,
            link: function($scope){
                $scope.is_turn = function(){
                    return $scope.table.data.turn == $scope.mouse.uid;
                };
                $scope.turnClass = function(){
                    return $scope.is_turn()? " turn": "";
                };
                $scope.is_player = Player.is($scope.mouse);

            },
            template:
                '<div ng-model="mouse">' +
                    '<cc-table-player ng-if="is_player"></cc-table-player>' +
                    '<div class="mouse{{turnClass()}}" ng-if="!is_player">' +
                        '<span class="name"> {{mouse.name}}: </span>' +
                        '<span> Points: {{mouse.points}} </span> | ' +
                        '<span> Hand: {{mouse.hand}} cards </span> | ' +
                        '<span> Stack: {{mouse.stack}} cards </span>' +
                    '</div>' +
                    '<br>' +
                '</div>'
        };
    }])
    .directive('ccTablePlayer', function(){
        return {
            restrict: 'E',
            replace: true,
            link: function($scope){
                $scope.never = function(){
                    return false;
                };
            },
            template:
                '<div class="player{{turnClass()}}">' +
                    '<div class="name"> {{mouse.name}}: </div>' +
                    '<div> Points: {{mouse.points}} </div>' +
                    '<div>' +
                        'Hand: ' +
                        '<cc-table-card table="table" card="card"' +
                                      ' ng-repeat="card in mouse.hand track by $index"' +
                                      ' enabled="isTurn"></cc-table-card>'+
                    '</div>' +
                    '<div>' +
                        'Stack:' +
                        '<cc-table-card table="table" card="card"' +
                                      ' ng-repeat="card in mouse.stack track by $index"' +
                                      ' enabled="never"></cc-table-card>'+
                    '</div>' +
                '</div>'
        };
    })
    .directive('ccTableCard', function(){
        return {
            restrict: 'E',
            replace: true,
            scope: {
                table: '=',
                card: '=',
                enabled: '='
            },
            link: function($scope){
                $scope.place = function(){
                    $scope.table.place($scope.card);
                };
            },
            template:
                '<button ng-click="place()" ng-disable="!enabled()">' +
                    '{{card}}' +
                '</button>'
        };
    });