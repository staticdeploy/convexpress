import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import {middleware} from "../src/validate-middleware";

chai.use(sinonChai);

describe("validate.middleware", () => {

    const params = [
        {
            name: "param1",
            in: "body",
            schema: {
                type: "object",
                properties: {
                    key: {
                        type: "string"
                    }
                }
            }
        },
        {
            name: "param2",
            in: "path"
        },
        {
            name: "param3",
            in: "query"
        },
        {
            name: "param4",
            in: "header"
        }
    ];
    const validReq = {
        body: {key: "value"},
        params: {param2: "value"},
        query: {param3: "value"},
        headers: {param4: "value"}
    };
    const invalidReq1 = {
        body: {key: 1},
        params: {param2: "value"},
        query: {param3: "value"},
        headers: {param4: "value"}
    };
    const invalidReq2 = {
        body: {key: "value"},
        params: {param2: 2},
        query: {param3: "value"},
        headers: {param4: "value"}
    };
    const invalidReq3 = {
        body: {key: "value"},
        params: {param2: "value"},
        query: {param3: 3},
        headers: {param4: "value"}
    };
    const invalidReq4 = {
        body: {key: "value"},
        params: {param2: "value"},
        query: {param3: "value"},
        headers: {param4: 4}
    };
    const res = {
        status: sinon.spy(() => res),
        send: sinon.spy()
    };
    const next = sinon.spy();

    beforeEach(() => {
        res.status.reset();
        res.send.reset();
        next.reset();
    });

    const mw = middleware(params);

    it("next on valid request", () => {
        mw(validReq, res, next);
        expect(next).to.have.callCount(1);
        expect(res.status).to.have.callCount(0);
        expect(res.send).to.have.callCount(0);
    });

    it("400 on invalid request [CASE: invalid body]", () => {
        mw(invalidReq1, res, next);
        expect(next).to.have.callCount(0);
        expect(res.status).to.have.callCount(1);
        expect(res.status).to.have.been.calledWith(400);
        expect(res.send).to.have.callCount(1);
    });

    it("400 on invalid request [CASE: invalid path]", () => {
        mw(invalidReq2, res, next);
        expect(next).to.have.callCount(0);
        expect(res.status).to.have.callCount(1);
        expect(res.status).to.have.been.calledWith(400);
        expect(res.send).to.have.callCount(1);
    });

    it("400 on invalid request [CASE: invalid query]", () => {
        mw(invalidReq3, res, next);
        expect(next).to.have.callCount(0);
        expect(res.status).to.have.callCount(1);
        expect(res.status).to.have.been.calledWith(400);
        expect(res.send).to.have.callCount(1);
    });

    it("400 on invalid request [CASE: invalid headers]", () => {
        mw(invalidReq4, res, next);
        expect(next).to.have.callCount(0);
        expect(res.status).to.have.callCount(1);
        expect(res.status).to.have.been.calledWith(400);
        expect(res.send).to.have.callCount(1);
    });

});
