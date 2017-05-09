(function(){

  'use strict';

  angular
    .module('app')
    .service('DbService', function DbService($http, $q, LsService, LSKEYS){
      var svc = this;

      var auth = 'FKrJ6yxlCTJ85aGXYQ0SgaSDQ3AAUzZvpOIv80UP';
      var baseUrl = 'https://nt-setlist.firebaseio.com/';

      function getUrl(path, params){
        var url = baseUrl + path + '.json?auth=' + auth;
        if(params){
          url += params;
        }
        return url;
      }

      function getLatestData(path){
        //var lsData = LsService.get(LSKEYS.data);
        //if(lsData){
        //  return $q.resolve(lsData);
        //}

        return $http.get(getUrl(path || '')).then(
          function(response){
            LsService.set(LSKEYS.data, response.data);
            return $q.resolve(response.data);
          },
          function(error){
            var lsData = LsService.get(LSKEYS.data);
            if(lsData){
              return $q.resolve(lsData);
            }
            return $q.reject(error);
          }
        );
      }

      svc.getLatestData = getLatestData;

    });

})();
