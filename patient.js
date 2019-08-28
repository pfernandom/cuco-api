
class PatientService {
    constructor(dbClient) {
        this.client = dbClient;
    }
    async init() {
        if (!this.isConnected) {
            await this.client.connect('clinic');
            this.patientDB = this.client.getCollection('patient');
            this.isConnected = true;
        }
    }

    async findAll() {
        const chars = await clinicDB.findAll();
    }
}