/// <reference path="../../../_references.ts" />

interface LastPlayedSong {
  url: string;
  num: number;
}

export class lastPlayedSongs implements IList.IQueryBasicAction {

  id = "last played songs";
  description = "";
  regexp = /^lps$/;
  priority = 10;

  private contr: IList.IController;

  constructor(p: IList.IQueryBasicActionParams) {
    var o = this;
    o.contr = p.inputParams.controller;
  }

  onQueryUpdate(query: string) {
    var o = this;
    o.getAllSortedLastPlayedSongs().done((data) => {
      var songs = o.getSongsFromLastPlayedSongs(data["songs"]);
      songs.forEach((song, i) => {
        song.name += " (" + data["songs"][i].num + ")";
      });
      o.contr.displayedSongs(songs);
    });
  }

  onRedirect(displayedSongsIndex: number) {
    var o = this;
    var song: IList.ISong = o.contr.displayedSongs()[displayedSongsIndex];
    return o.addUrlToLastPlayedSongs(song.url);
  }

  private getAllSortedLastPlayedSongs() {
    var o = this;
    var done = $.Deferred();
    new Pouch("idb://musicope", (err, db) => {
      db.get("lastPlayedSongs", (err, data) => {
        if (data && data["songs"]) {
          data["songs"] = o.sortSongsByUrl(data["songs"]);
          done.resolve(data, db);
        } else {
          done.resolve({ songs: [] }, db);
        }
      });
    });
    return done.promise();
  }

  private sortSongsByUrl(songs: LastPlayedSong[]) {
    var sortedSongs = songs.sort((a, b) => {
      if (a.num === b.num) {
        var x = a.url.toLowerCase(), y = b.url.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
      }
      return b.num - a.num;
    });
    return sortedSongs;
  }

  private getSongsFromLastPlayedSongs(songs: LastPlayedSong[]) {
    var songs: IList.ISong[] = songs.map((lastSong) => {
      var vals = lastSong.url.match(/^(.*\/)([^\/]+)\.([^.]+)$/);
      var song: IList.ISong = {
        path: vals[1],
        name: vals[2],
        extension: vals[3],
        url: lastSong.url
      };
      return song;
    });
    return songs;
  }

  private addUrlToLastPlayedSongs(url: string) {
    var o = this;
    var done = $.Deferred();
    o.getAllSortedLastPlayedSongs().done(
      (data, db: ph.DB) => {
        var songs: LastPlayedSong[] = data["songs"];
        var index = o.indexOfSameUrl(songs, url);
        if (index === -1) {
          songs.push({ url: url, num: 0 });
          if (songs.length > 20) { songs.shift(); }
          index = songs.length - 1;
        }
        data["songs"][index]["num"]++;
        data["songs"] = songs;
        if (!data["_id"]) {
          data["_id"] = "lastPlayedSongs";
        }
        db.put(data, (err, response) => {
          if (!err) {
            done.resolve();
          }
        });
      });
    return done.promise();
  }

  private indexOfSameUrl(songs: LastPlayedSong[], url: string) {
    for (var i = 0; i < songs.length; i++) {
      if (songs[i].url === url) {
        return i;
      }
    }
    return -1;
  }

}