angular.module('cc-mouse', ['cc-utils'])
    .factory('Mouse', ['Http', function(Http){
        return {
            player: undefined,
            bind: function(player, done){
                this.player = player;
                done(this);
            }
        };
    }]);