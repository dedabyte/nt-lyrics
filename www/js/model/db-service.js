(function(){

  'use strict';

  angular
    .module('app')
    .service('DbService', function DbService($http, $q, LsService, LSKEYS){
      var svc = this;

      var baseUrl = 'https://nt-setlist.firebaseio.com/';

      // function getUrl(path, params){
      //   var url = baseUrl + path + '.json?auth=' + auth;
      //   if(params){
      //     url += params;
      //   }
      //   return url;
      // }

      function getLatestData(auth){
        var url = baseUrl + '.json?auth=' + auth;
        return $http.get(url).then(
          function(response){
            LsService.set(LSKEYS.data, response.data);
            return $q.resolve(response.data);
          },
          function(error){
            console.warn('DB error', error);

            if(error.status >= 400 && error.status < 500){
              return $q.reject('ERR_AUTH');
            }

            var lsData = LsService.get(LSKEYS.data);
            if(lsData){
              return $q.resolve(lsData);
            }

            return $q.reject('ERR_DATA');
          }
        );
      }

      svc.getLatestData = getLatestData;

    });

})();
