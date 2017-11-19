const request = require("supertest");

const getServer = require("./get-server");

describe("e2e test: api", () => {
    describe("correctly serving the defined routes", () => {
        it("case: 200 and correct body on GET /pets", async () => {
            await request(getServer())
                .get("/pets")
                .expect(200)
                .expect([{ species: "dog" }, { species: "cat" }]);
        });
        it("case: 400 and error details on incorrect POST /pets", async () => {
            await request(getServer())
                .post("/pets")
                .send({ _species: "hamster" })
                .expect(400)
                .expect(/should NOT have additional properties/);
        });
        it("case: 201 and correct body on correct POST /pets", async () => {
            await request(getServer())
                .post("/pets")
                .send({ species: "hamster" })
                .expect(201)
                .expect({ species: "hamster" });
        });
    });
});
