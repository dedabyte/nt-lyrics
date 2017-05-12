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

          function selectSong(song, index){
            scope.selectedSong = song;
            scope.selectedSongIndex = index;
            scope.isSongsListOpen = false;

            jqSongContent.empty().scrollTop();
            if(objLyrics.hasOwnProperty(song.id)){
              var jqSongElement = $(objLyrics[song.id]);
              var jqStyle = jqSongElement.find('style');
              var jqSong = jqSongElement.find('nt-body');
              jqSongContent.empty().append(jqStyle).append(jqSong.html());
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
            return objLyrics.hasOwnProperty(song.id);
          }

          scope.fontSize = LsService.get(LSKEYS.fontSize) || 22;
          function getFontSize(){
            return 'span { font-size: ' + scope.fontSize + 'px !important; }'
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
              return 'span { font-weight: normal !important; }'
            }
            return '';
          }
          function toggleBold(){
            scope.isBold = !scope.isBold;
            LsService.set(LSKEYS.fontBold, scope.isBold);
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

          getLatestData();

        }
      };
    });

})();
