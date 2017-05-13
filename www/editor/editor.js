(function(){

  'use strict';

  angular.module('app', []);

  angular
    .module('app')
    .service('DbService', function DbService($http, $q){
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

      function get(json){
        return $http.get(getUrl(json));
      }

      function patch(json, data){
        return $http.patch(getUrl(json), data);
      }

      svc.get = get;
      svc.patch = patch;

    });

  angular
    .module('app')
    .directive('ntleMain', function ntleMain(DbService){
      return {
        link: function(scope, element){

          DbService.get('songs').then(
            function(response){
              scope.songs = _.toArray(response.data);
              scope.songs.sort(function(a, b){
                if(a.name.toLowerCase() < b.name.toLowerCase()){
                  return -1;
                }
                if(a.name.toLowerCase() > b.name.toLowerCase()){
                  return 1;
                }
                return 0;
              });
            }
          );

          function selectSong(song){
            scope.selectedSong = song;
            scope.selectedSongLyrics = '';
            DbService.get('lyrics/' + scope.selectedSong.id).then(
              function(response){
                console.log(response.data);
                scope.selectedSongLyrics = response.data;
              }
            );
          }

          function saveLyrics(){
            scope.selectedSongLyrics = replaceHtmlTags(scope.selectedSongLyrics);
            var patchObject = {};
            patchObject[scope.selectedSong.id] = scope.selectedSongLyrics;
            DbService.patch('lyrics', patchObject).then(
              function(response){
                console.log(response);
              },
              function(error){
                console.log(error);
              }
            );
          }

          function replaceHtmlTags(str){
            return str
              .replace('<html', '<nt-html')
              .replace('</html>', '</nt-html>')
              .replace('<body', '<nt-body')
              .replace('</body>', '</nt-body>');
          }

          scope.selectSong = selectSong;
          scope.saveLyrics = saveLyrics;

        }
      };
    });

})();
