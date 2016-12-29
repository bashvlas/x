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
    * `request`: configuration object
        * `.workerDir`: worker files directory (default = `"/"`)
        * `.numChannels`: number of channels (default = `2` (stereo))
        * `.encoding`: encoding (default = `"wav"`, see `.setEncoding()` for detail)
        * `.options`: options (see `.setOptions()` for detail)
        * you can also set event handlers (see "Event handlers" for detail)
* Returns
    * a Promise
    
Every configuration property has a default value (typically you ought to set only `.workerDir` and `.encoding`). You can change encoding by `.setEncoding()` and options by `.setOptions()` after construction.

If you use MP3 encoding, you cannot change `.numChannels` from default (current MP3 encoder supports 2-channel stereo only).

> In fact, `configs` is just deep-copied into the recorder object itself.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
