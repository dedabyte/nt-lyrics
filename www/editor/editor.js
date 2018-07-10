(function(){

  'use strict';

  angular.module('app', []);

  angular
    .module('app')
    .service('DbService', function DbService($http){
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

      function put(json, data){
        return $http.put(getUrl(json), data);
      }

      svc.get = get;
      svc.patch = patch;
      svc.put = put;

    });

  angular
    .module('app')
    .directive('ntleMain', function ntleMain(DbService){
      return {
        link: function(scope){
          scope.newSongModel = {};

          writeMessage('Pokretanje...');

          init();

          function init(){
            scope.inProgress = true;
            return DbService.get('songs').then(
              function(response){
                scope.songs = _.toArray(response.data);
                sortSongs();
                writeMessage('Učitano.');
              },
              function(error){
                writeError('Greška pri pokretanju.', error);
              }
            ).finally(
              function(){ scope.inProgress = false; }
            );
          }

          function sortSongs(){
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

          function selectSong(song){
            scope.selectedSong = song;
            scope.editSongModel = _.clone(scope.selectedSong);

            if(scope.selectedSong.hasOwnProperty('lyrics')){
              scope.selectedSongLyrics = scope.selectedSong.lyrics;
              writeMessage('Učitan tekst za pesmu ' + scope.selectedSong.name + ' (keš).', undefined, {});
              return;
            }

            scope.selectedSongLyrics = '';
            scope.inProgress = true;
            DbService.get('lyrics/' + scope.selectedSong.id).then(
              function(response){
                scope.selectedSongLyrics = response.data;
                scope.selectedSong.lyrics = scope.selectedSongLyrics;
                writeMessage('Učitan tekst za pesmu ' + scope.selectedSong.name + '.', undefined, response);
              },
              function(error){
                writeError('Greška pri učitavanju teksta za pesmu ' + scope.selectedSong.name + '.', error);
              }
            ).finally(
              function(){ scope.inProgress = false; }
            );
          }

          function saveLyrics(){
            var patchObject = {};
            patchObject[scope.selectedSong.id] = scope.selectedSongLyrics;
            scope.inProgress = true;
            DbService.patch('lyrics', patchObject).then(
              function(response){
                scope.selectedSong.lyrics = scope.selectedSongLyrics;
                writeMessage('Zapisan tekst za pesmu ' + scope.selectedSong.name + '.', undefined, response);
              },
              function(error){
                writeError('Greška pri zapisivanju teksta za pesmu ' + scope.selectedSong.name + '.', error);
              }
            ).finally(
              function(){ scope.inProgress = false; }
            );
          }

          function writeMessage(message, type, logObject){
            scope.footerMessage = message;
            scope.footerClass = type;
            if(logObject){
              console.log(message, logObject);
            }
          }

          function writeError(message, errorObject){
            writeMessage(message, 'red');
            console.error(message, errorObject);
          }

          function openNewSongWindow(){
            scope.showNewSongWindow = true;
            scope.newSongModel.name = '';
            scope.newSongModel.nameAlt = '';
            scope.newSongModel.id = guid();
            scope.newSongModel.active = true;
          }

          function saveNewSong(){
            var newSongNameLower = replaceSrbChars(_.toLower(scope.newSongModel.name).trim());
            var nameAlreadyExists = _.find(scope.songs, function(song){
              return newSongNameLower === replaceSrbChars(_.toLower(song.name));
            });
            if(nameAlreadyExists){
              alert('Ta pesma već postoji.');
              return;
            }

            scope.inProgress = true;
            DbService.put('songs/' + scope.newSongModel.id, scope.newSongModel).then(
              function(response){
                scope.songs.push(_.clone(scope.newSongModel));
                sortSongs();
                writeMessage('Kreirana nova pesma ' + scope.newSongModel.name + '.', undefined, response);
              },
              function(error){
                writeError('Greška pri kreiranju nove pesme.', error);
              }
            ).finally(
              function(){
                scope.showNewSongWindow = false;
                scope.inProgress = false;
              }
            );
          }

          function saveSongMetadata(){
            scope.inProgress = true;
            DbService.put('songs/' + scope.editSongModel.id, scope.editSongModel).then(
              function(response){
                var updatedSongInList = _.find(scope.songs, { id: scope.editSongModel.id });
                _.assign(updatedSongInList, scope.editSongModel);
                sortSongs();
                writeMessage('Izmenjena pesma ' + scope.editSongModel.name + '.', undefined, response);
              },
              function(error){
                writeError('Greška pri izmeni pesme ' + scope.editSongModel.name + '.', error);
              }
            ).finally(
              function(){
                scope.inProgress = false;
              }
            );
          }

          function createNameAlt(model, event){
            if(event.keyCode === 13){
              model.nameAlt = replaceSrbChars(model.name);
            }
          }

          function guid() { // Public Domain/MIT
            var d = new Date().getTime();
            if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
              d += performance.now(); //use high-precision timer if available
            }
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
              var r = (d + Math.random() * 16) % 16 | 0;
              d = Math.floor(d / 16);
              return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
          }

          function replaceSrbChars(str){
            var map = {
              'š': 's',
              'đ': 'dj',
              'č': 'c',
              'ć': 'c',
              'ž': 'z',
              'Š': 'S',
              'Đ': 'Dj',
              'Č': 'C',
              'Ć': 'C',
              'Ž': 'Z'
            };
            var newStr = '';
            _.forEach(str, function(char){
              if(map.hasOwnProperty(char)){
                newStr += map[char];
              }else{
                newStr += char;
              }
            });
            return newStr;
          }

          scope.selectSong = selectSong;
          scope.saveLyrics = saveLyrics;
          scope.openNewSongWindow = openNewSongWindow;
          scope.saveNewSong = saveNewSong;
          scope.saveSongMetadata = saveSongMetadata;
          scope.createNameAlt = createNameAlt;

        }
      };
    });

})();
