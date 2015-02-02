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
                Http.poll('/tables/'+id+'/updated', function(data){
                    self.set(data);
                });
            };

            self.set = function(data){};
            self.get = function(){
                Http.get('/tables/'+id)
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
                    '<div class="view cc-table">' +
                        '<cc-table-mouse table="table" ng-model="table"' +
                        ' ng-repeat="(mouseId, mouse) in table.data.mice"' +
                        ' mouse="mouse"' +
                        ' ></cc-table-mouse>' +
                    '</div>' +
                '</div>'
        };
    }]);