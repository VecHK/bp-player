# 一个播放器而已。。。。。。

## Example

```javascript
let bp = new BP($('#audio')[0]);

bp.list = [
	{
		"title": "Name",
		"url": "AudioURL",
		"artist": "AudioArtist",
		"album": "AudioAlbum",
		"coverUrl": "CoverURL"
	}
];

bp.load();
bp.play();

```
