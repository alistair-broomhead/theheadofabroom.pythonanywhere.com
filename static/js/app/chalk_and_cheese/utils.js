angular.module('cc-utils', [])
    .service('Http', ['$http', '$timeout', function($http, $timeout){
        var self = this;

        self.server = 'http://localhost:5001';
        self.setAuth = function(user, password){
            $http.defaults.headers.common.Authorization =
                "Basic " + btoa(user + ":" + password);
        };

        self.delay = 200;

        self.poll = function(url, success){
            function poll(){
                self.poll(url, success);
            }
            $http.get(self.server + url, {"headers": self.headers})
                .success(success)
                .then(function(){
                    $timeout(poll, self.delay);
                });
        };
        self.get = function(url, cfg){
            return $http.get(self.server + url, cfg);
        };
        self.delete = function(url, cfg){
            return $http.delete(self.server + url, cfg);
        };
        self.head = function(url, cfg){
            return $http.head(self.server + url, cfg);
        };
        self.jsonp = function(url, cfg){
            return $http.jsonp(self.server + url, cfg);
        };
        self.post = function(url, body, cfg){
            return $http.post(self.server + url, body, cfg);
        };
        self.put = function(url, body, cfg){
            return $http.put(self.server + url, body, cfg);
        };
        self.patch = function(url, body){
            return $http.patch(self.server + url, body, cfg);
        };
    }]);