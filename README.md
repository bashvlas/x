# x

A JavaScript library for chrome extension development

## x.detector

A utility for finding elements in the DOM as soon as they appear there.

## x.ajax

A utility for working with asynchronous http requests.

``` javascript
x.ajax.fetch( request );
```

Start a fetch request.

* Parameters
    * `sourceNode`: source input (AudioNode object)
    * `configs`: configuration object
        * `.workerDir`: worker files directory (default = `"/"`)
        * `.numChannels`: number of channels (default = `2` (stereo))
        * `.encoding`: encoding (default = `"wav"`, see `.setEncoding()` for detail)
        * `.options`: options (see `.setOptions()` for detail)
        * you can also set event handlers (see "Event handlers" for detail)
* Returns
    * audio recorder object

Every configuration property has a default value (typically you ought to set only `.workerDir` and `.encoding`). You can change encoding by `.setEncoding()` and options by `.setOptions()` after construction.

If you use MP3 encoding, you cannot change `.numChannels` from default (current MP3 encoder supports 2-channel stereo only).

> In fact, `configs` is just deep-copied into the recorder object itself.

### Methods

``` javascript
recorder.setEncoding(encoding)
```

Change encoding after construction.

* Parameters
    * `.encoding`: encoding
        * `"wav"`: Waveform Audio (default)
        * `"ogg"`: Ogg Vorbis
        * `"mp3"`: MP3
* Returns
    * (none)

You can change encoding when recording is not running. If the method is called during recording, `.onError()` event is fired.

``` javascript
recorder.setOptions(options)
```

Set options.

* Parameters
    * `options`: options object
        * `.timeLimit`: recording time limit (second) (default = `300`)
        * `.encodeAfterRecord`: encoding process mode
            * `false`: process encoding on recording background (default)
            * `true`: process encoding after recording is finished
        * `.progressInterval`: encoding progress report interval (millisecond) (default = `1000`)
            * (used only if `.encodeAfterRecord` is `true`)
        * `.bufferSize`: recording buffer size (default = `undefined` (use browser default))
        * `.wav.mimeType`: Waveform Audio MIME type (default = `"audio/wav"`)
        * `.ogg.mimeType`: Ogg Vorbis MIME type (default = `"audio/ogg"`)
        * `.ogg.quality`: Ogg Vorbis quality (-0.1 .. 1) (default = `0.5`)
        * `.mp3.mimeType`: MP3 MIME type (default = `"audio/mpeg"`)
        * `.mp3.bitRate`: MP3 bit rate (typically 64 .. 320 for 44100Hz) (default = `160`)
* Returns
    * (none)

You can set options when recording is not running. If the method is called during recording, `.onError()` event is fired.

``` javascript
recorder.startRecording()
```

Start recording.

* Parameters
    * (none)
* Returns
    * (none)

If `.encoderAfterRecord` options is `false` (default), encoding process is performed on recording background.

If `.encoderAfterRecord` is `true`, audio data is just stored to worker's buffer. Encoding process is performed after recording is finished.

``` javascript
recorder.isRecording()
```

Return if recording is running.

* Parameters
    * (none)
* Returns
    * `false`: recording is not running
    * `true`: recording is running

``` javascript
recordingTime = recorder.recordingTime()
```

Report recording time.

* Parameters
    * (none)
* Returns
    * recording time (second) or `null` (not recording)

``` javascript
recorder.cancelRecording()
```

Cancel current recording without saving.

* Parameters
    * (none)
* Returns
    * (none)

``` javascript
recorder.finishRecording()
```

Finish current recording.

* Parameters
    * (none)
* Returns
    * (none)

If `.encoderAfterRecord` options is `false` (default), it finishes encoding and make a Blob object immediately. You get a Blob with `.onComplete()` event.

If `.encoderAfterRecord` is `true`, it starts encoding process. Encoding process may take several seconds to a few minutes (depending on recording time).  You can get encoding progress with `onEncodingProgress()` event. Getting a Blob is same as above.

``` javascript
recorder.cancelEncoding()
```

Cancel encoding.

* Parameters
    * (none)
* Returns
    * (none)

This method is used when `.encoderAfterRecord` is `true` and worker is processing encoding after `.finishRecording()`. You can interrupt worker's encoding process and do cleanup.

> Internally, it calls `worker.terminate()` to kill worker process and makes another worker.

### Event handlers

Encoder worker's responses are processed by event handlers. Some other breakpoints are also provided as events. Events summary is as below (first parameter is always recorder object).

``` javascript
recorder.onEncoderLoading = function(recorder, encoding) { ... }
recorder.onEncoderLoaded = function(recorder, encoding) { ... }
recorder.onTimeout = function(recorder) { ... }
recorder.onEncodingProgress = function (recorder, progress) { ... }
recorder.onEncodingCanceled = function(recorder) { ... }
recorder.onComplete = function(recorder, blob) { ... }
recorder.onError = function(recorder, message) { ... }
```

You can set an event handler to object property.

``` javascript
recorder = new WebAudioRecorder(source, { workerDir: "javascripts/" });
recorder.onComplete = function(rec, blob) {
  // use Blob
};
```

You can also set event handlers from constructor parameter.

``` javascript
recorder = new WebAudioRecorder(source, {
  workerDir: "javascripts/",
  onEncoderLoading: function(recorder, encoding) {
    // show "loading encoder..." display
  },
  onEncoderLoaded: function(recorder, encoding) {
    // hide "loading encoder..." display
  }
});
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
