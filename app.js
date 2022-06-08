const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");
let db = null;

const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });
        app.listen(3000, () => {
            console.log("Server Running at http://localhost:3000/");
        });
    } catch (e) {
        console.log(`DB Error: ${e.message}`);
        process.exit(1);
    }
};
initializeDBAndServer();

//API 1
app.get("/states/", async (request, response) => {
    const getStatesQuery = `
    SELECT *
    FROM state;`;
    const statesArray = await db.all(getStatesQuery);
    response.send(statesArray);
});

//API 2
app.get("/states/:stateId/", async (request, response) => {
    const { stateId } = request.params;
    const getStateQuery = `
    SELECT *
    FROM state
    WHERE stateId = ${stateId};`;
    const state = await db.get(getStateQuery);
    response.send(state);
});

//API 3
app.post("/districts/", async (request, response) => {
    const districtDetails = response.body;
    const {
        districtName,
        stateId,
        cases,
        cured,
        active,
        deaths,
    } = districtDetails;
    const insertDistrictQuery = `
    INSERT INTO district (district_name, state_id, cases,cured, active, deaths)
    VALUES('${districtName}', ${stateId}, ${cases}, ${cured}, ${active}, ${deaths});
    `;
    await db.run(insertDistrictQuery);
    response.send("District Successfully Added");
});

//API 4
app.get("/districts/:districtId/", async (request, response) => {
    const { districtId } = request.params;
    const getDistrictQuery = `SELECT * FROM district WHERE district_id = ${districtId};`;
    const district = await db.get(getDistrictQuery);
    response.send(district);
});

//API 5
app.delete("/districts/:districtId/", async (request, response) => {
    const { districtId } = request.params;
    const deleteDistrictQuery = `
    DELETE FROM district
    WHERE district_id = ${districtId};`;
    await d.run(deleteDistrictQuery);
    response.send("District Removed");
});

//API 6
app.put("/districts/:districtId/", async (request, response) => {
    const { districtId } = request.params;
    const districtDetails = request.body;
    const {
        districtName,
        stateId,
        cases,
        cured,
        active,
        deaths,
    } = districtDetails;
    const updateDistrictQuery = `
UPDATE district
SET 
district_name = '${districtName}',
state_id = ${stateId},
cases = ${cases},
cured = ${cured},
active = ${active},
deaths = ${deaths}
WHERE district_id = ${districtId};`;
    await db.run(updateDistrictQuery);
    response.send("District Details Updated");
});

//API 7
app.get("/states/:stateId/stats/", async (request, response) => {
    const { stateId } = request.params;
    const getTotalDetailsQuery = `
    SELECT 
    SUM(cases) AS totalCases,
    SUM(cured) AS totalCured,
    SUM(active) AS totalActive,
    SUM(deaths) AS totalDeaths
    FROM district
    WHERE state_id = ${stateId};`;
    const stateDetails = await db.get(getTotalDetailsQuery);
    response.send(stateDetails);
});

//API 8
app.get("/districts/:districtId/details/", async (request, response) => {
    const { districtId } = request.params;
    const getStateOfDistrictQuery = `
SELECT state.state_name AS stateName 
FROM state INNER JOIN district ON state.state_id = district.state_id
WHERE district.district_id = ${districtId};`;
    const stateDetails = await db.run(getStateOfDistrictQuery);
    response.send(stateDetails);
});
