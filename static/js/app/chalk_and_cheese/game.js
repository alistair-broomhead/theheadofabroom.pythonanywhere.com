angular.module('cc-game', ['cc-player', 'cc-lobby', 'cc-table'])
    .controller('ccGameCtrl', ['$scope', 'Lobby', 'Player', function ($scope, Lobby, Player){
        Player.bind(Lobby);
    }])
    .directive('ccRoot', ['Lobby', 'Tables', function(Lobby, Tables){
        // TODO - Change this when I implement better lobby
        return {
            restrict: 'E',
            replace: true,
            scope: {},
            link: function($scope){
                $scope.lobby = Lobby;
                $scope.tables = Tables;
            },
            template:
                '<div id="cc-root" class="tabs">' +
                    '<cc-lobby-tab lobby="lobby" model="lobby"></cc-lobby-tab>'+
                    '<cc-table-tab ng-model="tables" ng-repeat="index in tables.indices" index="index"></cc-table-tab>'+
                '</div>'
        };
    }]);