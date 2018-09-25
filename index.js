const AWS = require('aws-sdk');

const batch = new AWS.Batch({
    apiVersion: '2016-08-10',
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1'
});


const jobQueueName = '';

const containerName = 'sgurramkonda/test-node-app';


// ===========================================================================
// ========================= REGISTER JOB DEFINITION
// ===========================================================================

const regsisterJobDefinition = async (jobDefinitionName) => {
    const jobDefinitionParams = {
        type: "container",
        containerProperties: {
            // command: [
            //     "sleep",
            //     "10"
            // ],
            image: containerName,
            memory: 128,
            vcpus: 1
        },
        jobDefinitionName: jobDefinitionName
    };

    try {
        const jobDefinitionRes = await batch.registerJobDefinition(jobDefinitionParams).promise();
        console.log('jobDefinitionARN', jobDefinitionRes.jobDefinitionArn);
        return jobDefinitionRes.jobDefinitionArn
    } catch (err) {
        console.log('registerJobDefinition', err, err.stack);
    }

}


// ===========================================================================
// ========================= Check or create job definition
// ===========================================================================
const checkOrCreateJobDefinition = async (jobDefinitionName) => {

    const listJobDefParams = {
        jobDefinitionName: jobDefinitionName,
        status: "ACTIVE"
    };

    // Check if already a job definition exists or not. If not register job definition
    try {
        const jobDefData = await batch.describeJobDefinitions(listJobDefParams).promise();
        console.log('jobDefData', jobDefData);
        if (jobDefData.jobDefinitions.length) {
            return jobDefData.jobDefinitions[0].jobDefinitionArn;
        } else {
            return await regsisterJobDefinition(jobDefinitionName);
        }
    } catch (err) {
        console.log('describeJobDefinitions', err, err.stack);
    }
}


// ===========================================================================
// ========================= Submit a job
// ===========================================================================

const submitJob = async ({ jobName, jobDefinitionName }) => {

    try {
        const jobDefinitionArn = await checkOrCreateJobDefinition(jobDefinitionName);
        // Submit a job
        const jobPramas = {
            jobDefinition: jobDefinitionArn,
            jobName: jobName,
            jobQueue: jobQueueName
        };

        try {
            const jobData = await batch.submitJob(jobPramas).promise();
            console.log('job', jobData);
        } catch (err) {
            console.log('submitJob', err, err.stack);
        }

    } catch (err) {
        console.log('submit job', err, err.stack);
    }
}

submitJob({
    jobName: 'demoJob',
    jobDefinitionName: 'demoJobDef',
});