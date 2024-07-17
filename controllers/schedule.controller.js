const remoteConfig = require('../config/firebase_remote_config')
const { parseISO, isValid } = require('date-fns');
const schedule = require('node-schedule');

const getConfigTemplate =  async (_req, res) => {
    try {
        const template = await remoteConfig.getTemplate();
        res.status(200).json({
            success: true,
            data: template,
        });
    } catch (error) {
        res.status(400).json({error: `${error.message}`});
    }
};

const addConfig = async (req, res) => {
    const { key, description, defaultValue, conditionalValues, valueType } = req.body;
    if (!key || !defaultValue) {
        return res.status(400).json({ error: 'Both key and defaultValue parameters are required' });
    }
    const template = await remoteConfig.getTemplate();
    if (template.parameters.hasOwnProperty(key)) {
        return res.status(400).json({ error: `Parameter with key: ${key} already exists` });
    }

    if (conditionalValues) {
        const conditions = template.conditions.map((e) => e.name);
        for (let key of Object.keys(conditionalValues)) { 
            if (!conditions.includes(key)) {
                return res.status(400).json({ error: `Condition: ${key} doesn't exists` });
            }
        }
    }
    try {
        template.parameters[key] = {
            defaultValue: {
                value: defaultValue
            },
            conditionalValues: conditionalValues,
            valueType: valueType,
            description: description
        };
        await remoteConfig.validateTemplate(template);
        const updatedTemplate = await remoteConfig.publishTemplate(template);
        res.status(200).json({ success: true, data: updatedTemplate});
    } catch (error) {
        res.status(400).json({error: `${error.message}`});
    } 
};

const publishConfigUpdate = async (req, res) => {
    const { startDate, endDate, scheduleDate, key, defaultValue, conditionalValues, valueType } = req.body;
    if (!key || !defaultValue) {
        return res.status(400).json({ error: 'Both key and defaultValue parameters are required' });
    }

    let template = await remoteConfig.getTemplate();
    if (!template.parameters.hasOwnProperty(key)) {
        return res.status(400).json({ error: `Parameter with key: ${key} doesn't exists` });
    }

    if (conditionalValues) {
        const conditions = template.conditions.map((e) => e.name);
        for (let key of Object.keys(conditionalValues)) { 
            if (!conditions.includes(key)) {
                return res.status(400).json({ error: `Condition: ${key} doesn't exists` });
            }
        }
    }

    if (!startDate && !endDate && !scheduleDate) {
        // Publish Immediately
        try {
            template.parameters[key] = {
                defaultValue: {
                    value: defaultValue
                },
                conditionalValues: conditionalValues || template.parameters[key].conditionalValues,
                valueType: valueType,
                description: template.parameters[key].description
            };
            await remoteConfig.validateTemplate(template);
            await remoteConfig.publishTemplate(template);
            res.status(200).json({ success: true, message: `Update for config variable: ${key} successful` });
        } catch (error) {
            res.status(400).json({ error: `Failed to update config variable: ${error.message}` });
        }
    } else if (scheduleDate) {
        // Publish on scheduled date & time
        const parsedScheduledDate = parseISO(scheduleDate);
        if (!isValid(parsedScheduledDate)) {
            return res.status(400).json({ error: 'Invalid date format' });
        }
        schedule.scheduleJob(parsedScheduledDate, async () => {
            try {
                template = await remoteConfig.getTemplate();
                template.parameters[key] = {
                    defaultValue: {
                        value: defaultValue
                    },
                    conditionalValues: conditionalValues || template.parameters[key].conditionalValues,
                    valueType: valueType,
                    description: template.parameters[key].description
                };
                await remoteConfig.validateTemplate(template);
                await remoteConfig.publishTemplate(template);
                console.log(`Updated config variable: ${key}`);
            } catch (error) {
                console.log(`Failed to update config: ${error.message}`);
            }
        });
        res.status(200).json({ success: true, message: `Scheduled update for config variable: ${key} at ${parsedScheduledDate}` });
    } else if (startDate && endDate) {
        // Publish on scheduled startDate and revert back on scheduled endDate
        const parsedStartDate = parseISO(startDate);
        const parsedEndDate = parseISO(endDate);
        if (!isValid(parsedStartDate) || !isValid(parsedEndDate)) {
            return res.status(400).json({ error: 'Invalid date format' });
        }
        let savedDefaultValue = null;
        let savedConditionalValues = null;
        // Schedule job to update config to new value at startDate & save current value to revert on endDate
        schedule.scheduleJob(parsedStartDate, async () => {
            try {
                template = await remoteConfig.getTemplate();
                savedDefaultValue = template.parameters[key].defaultValue.value;
                savedConditionalValues = template.parameters[key].conditionalValues;
                template.parameters[key] = {
                    defaultValue: {
                        value: defaultValue
                    },
                    conditionalValues: conditionalValues || savedConditionalValues,
                    valueType: valueType,
                    description: template.parameters[key].description
                };
                await remoteConfig.validateTemplate(template);
                await remoteConfig.publishTemplate(template);
                console.log(`Updated config variable: ${key}`);
            } catch (error) {
                console.log(`Failed to update config: ${error.message}`);
            }
        });
        // Schedule job to revert config to defaultValue at endDate
        schedule.scheduleJob(parsedEndDate, async () => {
            try {
                template = await remoteConfig.getTemplate();
                template.parameters[key] = {
                    defaultValue: {
                        value: savedDefaultValue
                    },
                    conditionalValues: savedConditionalValues,
                    valueType: valueType,
                    description: template.parameters[key].description
                };
                await remoteConfig.validateTemplate(template);
                await remoteConfig.publishTemplate(template);
                console.log(`Reverted config variable: ${key}`);
            } catch (error) {
                console.log(`Failed to revert config variable: ${error.message}`);
            }
        });
        res.status(200).json({ success: true, message: `Scheduled update for config variable: ${key} from ${parsedStartDate} to ${parsedEndDate}` });
    } else if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Both startDate and endDate parameter is required' });
    }
};

module.exports = {
    getConfigTemplate,
    addConfig,
    publishConfigUpdate,
}