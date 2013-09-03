describe('uploader.basic.api.js', function () {
    var $uploader, fineuploader;

    beforeEach(function () {
        $fixture.append("<div id='fine-uploader'></div>");
        $uploader = $fixture.find("#fine-uploader");
    });

    describe('formatFileName', function () {

        beforeEach(function () {
            fineuploader = new qq.FineUploaderBasic({
                element: $uploader[0]
            });
        });

        it('shortens a long (> 33 chars) filename', function () {
            var filename = "EWDPYZFAMDDOLNQEJXVUEWDPYZFAMDDOLN";
            var filename_fmt = fineuploader._options.formatFileName(filename);
            assert.equal(filename_fmt,
                "EWDPYZFAMDDOLNQEJXV...EWDPYZFAMDDOLN",
                "expect filename to be shortened");
        });

        it('refuses to shorten a short (<= 33 chars) filename', function () {
            var filename = "abcdefg";
            var filename_fmt = fineuploader._options.formatFileName(filename);
            assert.equal(filename_fmt,
                "abcdefg",
                "expect filename to NOT be shortened");
        });
    });

    describe('setParams', function () {

        beforeEach(function () {
            fineuploader = new qq.FineUploaderBasic({ 
                element: $uploader[0]
            });
        });

        it('resets', function () {
            var params = {"hello": "world"}
            fineuploader.setParams(params, 'foo');
            assert.deepEqual(fineuploader._paramsStore.getParams('foo'), params,
                "the request parameters should be set"); 
            fineuploader._paramsStore.reset();
            assert.deepEqual(fineuploader._paramsStore.getParams('foo'), {},
                "the request parameters should be reset");
        });

        it('set simple key-value parameters', function () {
            var params = {"hello": "world"}
            fineuploader.setParams(params);
            assert.deepEqual(fineuploader._options.request.params, params,
                "the request parameters should be set"); 
        });

        it('set nested objects as parameters', function () {
            var params = {
                "hello": {
                    "confusing": "world"
                }
            };
            fineuploader.setParams(params);
            assert.deepEqual(fineuploader._options.request.params, params,
                "the request parameters should be set"); 
        });

        it('set function return values as parameters', function () {
            var params = {
                hello_func: function () {
                    return 42;
                }
            }
            fineuploader.setParams(params);
            assert.deepEqual(fineuploader._options.request.params, params,
                "the request parameters should be set"); 
        });

        it('allows changing parameters for a specific file id', function () {
            var params = {"hello": "world"}
            fineuploader.setParams(params, 'foo');
            assert.deepEqual(fineuploader._paramsStore.getParams('foo'), params,
                "the request parameters should be set"); 

        });

        it('allows changing paramters for all files', function () {
            var params = {"hello": "world"}
            fineuploader.setParams(params);
            assert.deepEqual(fineuploader._paramsStore.getParams(), params,
                "the request parameters should be set"); 
        });

    });

    describe('setEndpoint', function () {

        beforeEach(function () {
            fineuploader = new qq.FineUploaderBasic({ 
                element: $uploader[0]
            });
        });

        it('resets', function () {
            var endpoint = '/endpoint';
            fineuploader.setEndpoint(endpoint, 'foo');
            var ep = fineuploader._endpointStore.getEndpoint('foo');
            assert.deepEqual(ep,
                endpoint,
                "the endpoint should be set"); 
            fineuploader._endpointStore.reset();
            ep = fineuploader._endpointStore.getEndpoint('foo'); 
            assert.deepEqual(ep, fineuploader._options.request.endpoint, "the endpoint should be reset");
        });

        it('set a new endpoint', function () {
            var endpoint = '/endpoint'; 
            fineuploader.setEndpoint(endpoint, 'foo');
            var ep = fineuploader._endpointStore.getEndpoint('foo');
            assert.deepEqual(ep, endpoint, "the endpoint should be set"); 
        });

    });

    describe("_isAllowedExtension", function() {
        it("allows files if no restrictions are in place", function() {
            fineuploader = new qq.FineUploaderBasic();

            assert.ok(fineuploader._isAllowedExtension("foo.bar"));
            assert.ok(fineuploader._isAllowedExtension("foo.bar.bat"));
            assert.ok(fineuploader._isAllowedExtension("foo"));
        });

        it("doesn't choke if allowed extensions are not valid (i.e. not strings)", function() {
            fineuploader = new qq.FineUploaderBasic({
                validation: {
                    allowedExtensions: [{}]
                }
            });

            assert.ok(!fineuploader._isAllowedExtension("foo.bar"));
            assert.ok(!fineuploader._isAllowedExtension("foo.bar.bat"));
            assert.ok(!fineuploader._isAllowedExtension("foo"));
        });

        it("only allows valid extensions", function() {
            fineuploader = new qq.FineUploaderBasic({
                validation: {
                    allowedExtensions: ["bar", "exe", "png"]
                }
            });

            assert.ok(fineuploader._isAllowedExtension("foo.bar"));
            assert.ok(fineuploader._isAllowedExtension("foo.fee.exe"));
            assert.ok(fineuploader._isAllowedExtension("png.png"));
            assert.ok(!fineuploader._isAllowedExtension("foo.bar.bat"));
            assert.ok(!fineuploader._isAllowedExtension("foo"));
            assert.ok(!fineuploader._isAllowedExtension("png"));
        });
    });

    describe("_handleCheckedCallback", function() {
        beforeEach(function () {
            fineuploader = new qq.FineUploaderBasic();
        });

        it("handles successful non-promissory callbacks (undefined return value)", function() {
            var callback = function() {},
                spec = {
                    callback: callback,
                    onSuccess: function(callbackRetVal) {
                        assert.deepEqual(callbackRetVal, undefined);
                    },
                    onFailure: function() {
                        assert.failure();
                    }
                };

            fineuploader._handleCheckedCallback(spec);
        });

        it("handles successful non-promissory callbacks (defined return value)", function() {
            var callback = function() {
                    return "foobar";
                },
                spec = {
                    callback: callback,
                    onSuccess: function(callbackRetVal) {
                        assert.deepEqual(callbackRetVal, "foobar");
                    }
                };

            assert.deepEqual(fineuploader._handleCheckedCallback(spec), "foobar");
        });

        it("handles failed non-promissory callbacks (defined onFailure)", function(done) {
            var callback = function() {
                    return false;
                },
                spec = {
                    callback: callback,
                    onSuccess: function() {
                        assert.fail();
                        done();
                    },
                    onFailure: function() {
                        done();
                    }
                };

            fineuploader._handleCheckedCallback(spec);
        });

        it("handles failed non-promissory callbacks (undefined onFailure)", function(done) {
            var callback = function() {
                    return false;
                },
                spec = {
                    callback: callback,
                    onSuccess: function() {
                        assert.fail();
                    }
                };

            fineuploader._handleCheckedCallback(spec);
            done();
        });

        it ("handles successful promissory callbacks", function(done) {
            var callback = function() {
                    var promise = new qq.Promise();

                    setTimeout(function() {
                        promise.success("foobar");
                    }, 100);

                    return promise;
                },
                spec = {
                    callback: callback,
                    onSuccess: function(passedVal) {
                        assert.deepEqual(passedVal, "foobar");
                        done();
                    },
                    onFailure: function() {
                        assert.fail();
                        done();
                    }
                };

                assert.ok(qq.isPromise(fineuploader._handleCheckedCallback(spec)));
        });

        it ("handles failed promissory callbacks", function(done) {
            var callback = function() {
                    var promise = new qq.Promise();

                    setTimeout(function() {
                        promise.failure();
                    }, 100);

                    return promise;
                },
                spec = {
                    callback: callback,
                    onSuccess: function() {
                        assert.fail();
                        done();
                    },
                    onFailure: function() {
                        done();
                    }
                };

            assert.ok(qq.isPromise(fineuploader._handleCheckedCallback(spec)));
        });
    });

});