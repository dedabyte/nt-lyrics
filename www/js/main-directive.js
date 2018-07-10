(function(){

  'use strict';

  angular
    .module('app')
    .directive('ntlMain', function ntlMain(DbService, LsService, LSKEYS){
      return {
        templateUrl: 'js/main-template.html',
        link: function(scope, element){

          var arrSetlists = [];
          var arrSongs = [];
          var objSongs = [];
          var objLyrics = {};

          var jqSongContent = element.find('.song-content');

          scope.isSetlistsListOpen = false;
          scope.isSongsListOpen = false;

          scope.selectedSetlist = null;
          scope.selectedSong = null;

          function getLatestData(){
            DbService.getLatestData().then(
              init
            );
          }

          function init(data){
            arrSetlists = _.toArray(data.setlists);
            arrSetlists.sort(function(a, b){
              var ats = a.updated || a.created;
              var bts = b.updated || b.created;
              if(ats < bts){
                return 1;
              }
              if(ats > bts){
                return -1;
              }
              return 0;
            });
            arrSetlists.unshift({
              name: 'SVE PESME',
              isAll: true
            });
            //console.log(arrSetlists);
            scope.setlists = arrSetlists;

            objSongs = data.songs;
            arrSongs = _.toArray(data.songs);
            arrSongs.sort(function(a, b){
              if(a.name.toLowerCase() < b.name.toLowerCase()){
                return -1;
              }
              if(a.name.toLowerCase() > b.name.toLowerCase()){
                return 1;
              }
              return 0;
            });
            //console.log(arrSongs);

            objLyrics = data.lyrics;
            //console.log(data.lyrics);

            selectSetlist(arrSetlists[0]);

            console.log(JSON.stringify(_.map(arrSongs, function(song){
              return [song.name, song.id]
            }), null, 2));
          }

          function filterSongsForSelectedSetlist(){
            if(scope.selectedSetlist.isAll){
              scope.songs = arrSongs;
            }else{
              scope.songs = [];
              _.forEach(scope.selectedSetlist.songs, function(songId){
                if(objSongs.hasOwnProperty(songId)){
                  scope.songs.push(objSongs[songId]);
                }
              });
            }
            selectSong(scope.songs[0], 0);
          }

          function selectSetlist(setlist){
            scope.selectedSetlist = setlist;
            scope.isSetlistsListOpen = false;
            filterSongsForSelectedSetlist();
          }

          //function selectSong(song, index){
          //  scope.selectedSong = song;
          //  scope.selectedSongIndex = index;
          //  scope.isSongsListOpen = false;
          //
          //  jqSongContent.empty().scrollTop();
          //  if(objLyrics.hasOwnProperty(song.id)){
          //    var jqSongElement = $(objLyrics[song.id]);
          //    var jqStyle = jqSongElement.find('style');
          //    var jqSong = jqSongElement.find('nt-body');
          //    jqSongContent.empty().append(jqStyle).append(jqSong.html());
          //  }
          //}

          function selectSong(song, index){
            scope.selectedSong = song;
            scope.selectedSongIndex = index;
            scope.isSongsListOpen = false;

            jqSongContent.empty().scrollTop();
            if(objLyrics.hasOwnProperty(song.id)){
              var starCounter = 0;
              var lyricsHtml = objLyrics[song.id]
                .replace(/\t/g, '<span class="tab"></span>')
                .replace(/\*/g, function(){
                  var rest = starCounter % 2;
                  starCounter++;
                  if(!rest){
                    return '<span class="star">';
                  }
                  return '</span>';
                })
                .split('\n')
                .map(function(p){
                  return '<p class="p">' + p + '</p>';
                })
                .join('');

              jqSongContent.html(lyricsHtml);
            }
          }

          function selectNextSong(){
            var nextIndex = scope.selectedSongIndex + 1;
            var songToSelect = scope.songs[nextIndex];
            selectSong(songToSelect, nextIndex);
          }

          function selectPrevSong(){
            var prevIndex = scope.selectedSongIndex - 1;
            var songToSelect = scope.songs[prevIndex];
            selectSong(songToSelect, prevIndex);
          }

          function hasSongLyrics(song){
            return objLyrics.hasOwnProperty(song.id) && objLyrics[song.id];
          }

          scope.fontSize = LsService.get(LSKEYS.fontSize) || 22;
          function getFontSize(){
            return '.p { font-size: ' + scope.fontSize + 'px; min-height: ' + scope.fontSize + 'px; }'
          }
          function changeFontSize(increment){
            scope.fontSize = scope.fontSize + increment;
            LsService.set(LSKEYS.fontSize, scope.fontSize);
          }

          scope.isBold = LsService.get(LSKEYS.fontBold);
          if(scope.isBold !== true && scope.isBold !== false){
            scope.isBold = true;
          }
          function getBold(){
            if(!scope.isBold){
              return '.p { font-weight: normal; }';
            }else{
              return '.p { font-weight: bold; }';
            }
            //return '';
          }
          function toggleBold(){
            scope.isBold = !scope.isBold;
            LsService.set(LSKEYS.fontBold, scope.isBold);
          }

          scope.isDark = LsService.get(LSKEYS.themeDarK);
          if(scope.isDark !== true && scope.isDark !== false){
            scope.isDark = false;
          }
          function toggleTheme(){
            scope.isDark = !scope.isDark;
            LsService.set(LSKEYS.themeDarK, scope.isDark);
          }

          scope.selectSetlist = selectSetlist;
          scope.selectSong = selectSong;
          scope.selectNextSong = selectNextSong;
          scope.selectPrevSong = selectPrevSong;
          scope.hasSongLyrics = hasSongLyrics;
          scope.getFontSize = getFontSize;
          scope.changeFontSize = changeFontSize;
          scope.getBold = getBold;
          scope.toggleBold = toggleBold;
          scope.toggleTheme = toggleTheme;

          getLatestData();

        }
      };
    });

})();
