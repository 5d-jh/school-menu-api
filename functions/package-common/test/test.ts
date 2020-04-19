import assert from "assert";
import { JsonResponseBody } from "../src/util/JsonResponseBody";

describe("[COMMON] util", function () {
    it(
        'Should throw InvalidResponseBody error when server_message is overriden',
        (done) => {
            assert.throws(() => {
                const jsonResponseBody = new JsonResponseBody();
                jsonResponseBody.create({ server_message: '' });
            });
            done();
        }
    );
});