angular.module('cc-lobby', ['cc-utils'])
    .service('Lobby', ['Player', 'Http', 'Tables', function(Player, Http, Tables){
        var self = this;
        self.data = undefined;

        self.bind = function(){
            // Change this when I support multiple tables
            Http.get('/lobby')
                .success(function(data){
                    self.data = data;
                }).then(function(){
                     self.poll();
                });
        };

        self.poll = function(){
            Http.poll('/lobby/updated', function(response){
                if (response.change){
                    // There has been an update
                     self.data = response.data;
                }
            });
        };

        self.toggleReady = function(){
            Http.post('/lobby/ready', !self.data[Player.id].ready);
        };
    }])
    .directive('ccLobbyMouse', ['Lobby', 'Player', function(Lobby, Player){
        return {
            restrict: 'E',
            replace: true,
            link: function($scope){
                $scope.is_player = function(){
                    return Player.is($scope.mouse);
                };
                if ($scope.is_player()) $scope.player = Player;
            },
            template:
                '<div>' +
                    '<span ng-if="is_player()">' +
                        '<input type="text" value="{{mouse.name}}" ng-model="player.data.name" ng-change="player.nameChange()"/> is ' +
                        '<button ng-click="lobby.toggleReady()">' +
                            '<span ng-if="!mouse.ready">not </span>'+
                            'ready' +
                        '</button>' +
                    '</span>' +
                    '<span ng-if="!is_player()">' +
                        '{{mouse.name}} is ' +
                        '<span ng-if="!mouse.ready">not </span>'+
                        'ready' +
                    '</span>' +
                '</div>'
        };
    }])
    .directive('ccLobbyTab', function(){
        // TODO - Change this when I implement better lobby
        return {
            restrict: 'E',
            replace: true,
            scope: {
                lobby: '='
            },
            template:
                '<div id="lobby" class="tab lobby-tab">' +
                    '<a href="#lobby">Lobby</a>' +
                    '<div class="view cc-lobby">' +
                        '<cc-lobby-mouse' +
                        ' ng-repeat="(mouseId, mouse) in lobby.data"' +
                        ' mouse="mouse"' +
                        ' lobby="lobby"></cc-lobby-mouse>' +
                    '</div>' +
                '</div>'
        };
    });