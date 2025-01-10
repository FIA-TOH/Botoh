import en_messages from '../locales/messages/en.json';
import es_messages from '../locales/messages/es.json';
import fr_messages from '../locales/messages/fr.json';
import tr_messages from '../locales/messages/tr.json';
import pt_messages from '../locales/messages/pt.json';
import {playerList} from "./playerList";
import {DEFAULT_LANGUAGE, Language} from "./language";



export function getPlayerLanguage(playerID: number): Language {
    if (playerID === null) return DEFAULT_LANGUAGE
    return playerList[playerID].language

}

export type LocalizedMessageFunction = {
    [key in Language]: string
}

function replaceTemplateString(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, v) => variables[v] || '');
}

export const MESSAGES = {
    CHANGE_MAP_SUCCESS: (mapName: string): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.CHANGE_MAP_SUCCESS, {mapName: mapName}),
        es: replaceTemplateString(es_messages.CHANGE_MAP_SUCCESS, {mapName: mapName}),
        fr: replaceTemplateString(fr_messages.CHANGE_MAP_SUCCESS, {mapName: mapName}),
        tr: replaceTemplateString(tr_messages.CHANGE_MAP_SUCCESS, {mapName: mapName}),
        pt: replaceTemplateString(pt_messages.CHANGE_MAP_SUCCESS, {mapName: mapName}),
    }),
    CHANGE_MAP_FAILURE: (): LocalizedMessageFunction => ({
        en: en_messages.CHANGE_MAP_FAILURE,
        es: es_messages.CHANGE_MAP_FAILURE,
        fr: fr_messages.CHANGE_MAP_FAILURE,
        tr: tr_messages.CHANGE_MAP_FAILURE,
        pt: pt_messages.CHANGE_MAP_FAILURE,
    }),
    ADMIN_ALREADY_IN_ROOM: (): LocalizedMessageFunction => ({
        en: en_messages.ADMIN_ALREADY_IN_ROOM,
        es: es_messages.ADMIN_ALREADY_IN_ROOM,
        fr: fr_messages.ADMIN_ALREADY_IN_ROOM,
        tr: tr_messages.ADMIN_ALREADY_IN_ROOM,
        pt: pt_messages.ADMIN_ALREADY_IN_ROOM,
    }),
    AVAILABLE_COMMANDS: (): LocalizedMessageFunction => ({
        en: en_messages.AVAILABLE_COMMANDS,
        es: es_messages.AVAILABLE_COMMANDS,
        fr: fr_messages.AVAILABLE_COMMANDS,
        tr: fr_messages.AVAILABLE_COMMANDS,
        pt: pt_messages.AVAILABLE_COMMANDS,
    }),
    NON_ADMIN_COMMANDS: (): LocalizedMessageFunction => ({
        en: en_messages.NON_ADMIN_COMMANDS,
        es: es_messages.NON_ADMIN_COMMANDS,
        fr: fr_messages.NON_ADMIN_COMMANDS,
        tr: fr_messages.NON_ADMIN_COMMANDS,
        pt: pt_messages.NON_ADMIN_COMMANDS,
    }),
    LAPS_ON_CURRENT_TIRE: (currentLaps: number): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.LAPS_ON_CURRENT_TIRE, {
            currentLaps: currentLaps.toString()
        }),
        es: replaceTemplateString(es_messages.LAPS_ON_CURRENT_TIRE, {
            currentLaps: currentLaps.toString()
        }),
        fr: replaceTemplateString(fr_messages.LAPS_ON_CURRENT_TIRE, {
            currentLaps: currentLaps.toString()
        }),
        tr: replaceTemplateString(tr_messages.LAPS_ON_CURRENT_TIRE, {
            currentLaps: currentLaps.toString()
        }),
        pt: replaceTemplateString(pt_messages.LAPS_ON_CURRENT_TIRE, {
            currentLaps: currentLaps.toString()
        }),
    }),
    WEAR_ON_CURRENT_TIRE: (remainingPercentage: number): LocalizedMessageFunction => {
        if (remainingPercentage <= 0) {
            
            return {
                en: en_messages.FLAT_TYRE,
                es: es_messages.FLAT_TYRE,
                fr: fr_messages.FLAT_TYRE,
                tr: tr_messages.FLAT_TYRE,
                pt: pt_messages.FLAT_TYRE,
            };
        } else if (remainingPercentage <= 5) {
            return {
                en: en_messages.FIVE_PERCENTAGE_TYRES,
                es: es_messages.FIVE_PERCENTAGE_TYRES,
                fr: fr_messages.FIVE_PERCENTAGE_TYRES,
                tr: tr_messages.FIVE_PERCENTAGE_TYRES,
                pt: pt_messages.FIVE_PERCENTAGE_TYRES,
            };
        } else if (remainingPercentage <= 10) {
            return {
                en: en_messages.TEN_PERCENTAGE_TYRES,
                es: es_messages.TEN_PERCENTAGE_TYRES,
                fr: fr_messages.TEN_PERCENTAGE_TYRES,
                tr: tr_messages.TEN_PERCENTAGE_TYRES,
                pt: pt_messages.TEN_PERCENTAGE_TYRES,
            };
        } else if (remainingPercentage <= 25) {
            return {
                en: en_messages.TWENTYFIVE_PERCENTAGE_TYRES,
                es: es_messages.TWENTYFIVE_PERCENTAGE_TYRES,
                fr: fr_messages.TWENTYFIVE_PERCENTAGE_TYRES,
                tr: tr_messages.TWENTYFIVE_PERCENTAGE_TYRES,
                pt: pt_messages.TWENTYFIVE_PERCENTAGE_TYRES,
            };
        } else if (remainingPercentage <= 40) {
            return {
                en: en_messages.FOURTHY_PERCENTAGE_TYRES,
                es: es_messages.FOURTHY_PERCENTAGE_TYRES,
                fr: fr_messages.FOURTHY_PERCENTAGE_TYRES,
                tr: tr_messages.FOURTHY_PERCENTAGE_TYRES,
                pt: pt_messages.FOURTHY_PERCENTAGE_TYRES,
            };
        } else if (remainingPercentage <= 60) {
            return {
                en: en_messages.SIXTHY_PERCENTAGE_TYRES,
                es: en_messages.SIXTHY_PERCENTAGE_TYRES,
                fr: en_messages.SIXTHY_PERCENTAGE_TYRES,
                tr: en_messages.SIXTHY_PERCENTAGE_TYRES,
                pt: pt_messages.SIXTHY_PERCENTAGE_TYRES,
            };
        } else if (remainingPercentage <= 75) {
            return {
                en: en_messages.SEVENTY_PERCENTAGE_TYRES,
                es: es_messages.SEVENTY_PERCENTAGE_TYRES,
                fr: fr_messages.SEVENTY_PERCENTAGE_TYRES,
                tr: fr_messages.SEVENTY_PERCENTAGE_TYRES,
                pt: pt_messages.SEVENTY_PERCENTAGE_TYRES,
            };
        } else if (remainingPercentage <= 90) {
            return {
                en: en_messages.HEATED_TYRES,
                es: es_messages.HEATED_TYRES,
                fr: fr_messages.HEATED_TYRES,
                tr: fr_messages.HEATED_TYRES,
                pt: pt_messages.HEATED_TYRES,
            };
        }
        return {
            en: "Unknown tyre status.",
            es: "Estado de neumáticos desconocido.",
            fr: "État des pneus inconnu.",
            tr: "Lastik durumu bilinmiyor.",
            pt: "Pneu desconhecido",
        };
    },
    
    BOX_BOX_BOX: (): LocalizedMessageFunction => ({
        en: en_messages.BOX_BOX_BOX,
        es: es_messages.BOX_BOX_BOX,
        fr: fr_messages.BOX_BOX_BOX,
        tr: fr_messages.BOX_BOX_BOX,
        pt: pt_messages.BOX_BOX_BOX,
    }),
    BLOWN_OUT_TIRES: (): LocalizedMessageFunction => ({
        en: en_messages.BLOWN_OUT_TIRES,
        es: es_messages.BLOWN_OUT_TIRES,
        fr: fr_messages.BLOWN_OUT_TIRES,
        tr: fr_messages.BLOWN_OUT_TIRES,
        pt: pt_messages.BLOWN_OUT_TIRES,
    }),
    NOW_SHOWING_TIRES: (): LocalizedMessageFunction => ({
        en: en_messages.NOW_SHOWING_TIRES,
        es: es_messages.NOW_SHOWING_TIRES,
        fr: fr_messages.NOW_SHOWING_TIRES,
        tr: fr_messages.NOW_SHOWING_TIRES,
        pt: pt_messages.NOW_SHOWING_TIRES,
    }),
    NOW_SHOWING_SPEED: (): LocalizedMessageFunction => ({
        en: en_messages.NOW_SHOWING_SPEED,
        es: es_messages.NOW_SHOWING_SPEED,
        fr: fr_messages.NOW_SHOWING_SPEED,
        tr: fr_messages.NOW_SHOWING_SPEED,
        pt: pt_messages.NOW_SHOWING_SPEED,
    }),
    NOW_SHOWING_AVATAR: (): LocalizedMessageFunction => ({
        en: en_messages.NOW_SHOWING_AVATAR,
        es: es_messages.NOW_SHOWING_AVATAR,
        fr: fr_messages.NOW_SHOWING_AVATAR,
        tr: fr_messages.NOW_SHOWING_AVATAR,
        pt: pt_messages.NOW_SHOWING_AVATAR,
    }),
    NOT_RUNNER: (): LocalizedMessageFunction => ({
        en: en_messages.NOT_RUNNER,
        es: es_messages.NOT_RUNNER,
        fr: fr_messages.NOT_RUNNER,
        tr: fr_messages.NOT_RUNNER,
        pt: pt_messages.NOT_RUNNER,
    }),
    NOT_IN_BOXES: (): LocalizedMessageFunction => ({
        en: en_messages.NOT_IN_BOXES,
        es: es_messages.NOT_IN_BOXES,
        fr: fr_messages.NOT_IN_BOXES,
        tr: fr_messages.NOT_IN_BOXES,
        pt: pt_messages.NOT_IN_BOXES,
    }),
    NOT_IMPLEMENTED_TIRES: (): LocalizedMessageFunction => ({
        en: en_messages.NOT_IMPLEMENTED_TIRES,
        es: es_messages.NOT_IMPLEMENTED_TIRES,
        fr: fr_messages.NOT_IMPLEMENTED_TIRES,
        tr: fr_messages.NOT_IMPLEMENTED_TIRES,
        pt: pt_messages.NOT_IMPLEMENTED_TIRES,
    }),
    INVALID_TIRES: (): LocalizedMessageFunction => ({
        en: en_messages.INVALID_TIRES,
        es: es_messages.INVALID_TIRES,
        fr: fr_messages.INVALID_TIRES,
        tr: fr_messages.INVALID_TIRES,
        pt: pt_messages.INVALID_TIRES,
    }),
    CHANGED_TIRES: (name: string, tires: string): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.CHANGED_TIRES, {name: name, tires: tires}),
        es: replaceTemplateString(es_messages.CHANGED_TIRES, {name: name, tires: tires}),
        fr: replaceTemplateString(fr_messages.CHANGED_TIRES, {name: name, tires: tires}),
        tr: replaceTemplateString(tr_messages.CHANGED_TIRES, {name: name, tires: tires}),
        pt: replaceTemplateString(pt_messages.CHANGED_TIRES, {name: name, tires: tires}),
    }),
    ALREADY_STARTED: (): LocalizedMessageFunction => ({
        en: en_messages.ALREADY_STARTED,
        es: es_messages.ALREADY_STARTED,
        fr: fr_messages.ALREADY_STARTED,
        tr: fr_messages.ALREADY_STARTED,
        pt: pt_messages.ALREADY_STARTED,
    }),
    INVALID_CIRCUIT_INDEX: (): LocalizedMessageFunction => ({
        en: en_messages.INVALID_CIRCUIT_INDEX,
        es: es_messages.INVALID_CIRCUIT_INDEX,
        fr: fr_messages.INVALID_CIRCUIT_INDEX,
        tr: fr_messages.INVALID_CIRCUIT_INDEX,
        pt: pt_messages.INVALID_CIRCUIT_INDEX,
    }),
    NON_EXISTENT_COMMAND: (): LocalizedMessageFunction => ({
        en: en_messages.NON_EXISTENT_COMMAND,
        es: es_messages.NON_EXISTENT_COMMAND,
        fr: fr_messages.NON_EXISTENT_COMMAND,
        tr: fr_messages.NON_EXISTENT_COMMAND,
        pt: pt_messages.NON_EXISTENT_COMMAND,
    }),

    LIST_MAPS: (maps: string): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.LIST_MAPS, {maps: maps}),
        es: replaceTemplateString(es_messages.LIST_MAPS, {maps: maps}),
        fr: replaceTemplateString(fr_messages.LIST_MAPS, {maps: maps}),
        tr: replaceTemplateString(tr_messages.LIST_MAPS, {maps: maps}),
        pt: replaceTemplateString(pt_messages.LIST_MAPS, {maps: maps}),
    }),

    VSC_ACTIVE: (): LocalizedMessageFunction => ({
        en: en_messages.VSC_ACTIVE,
        es: es_messages.VSC_ACTIVE,
        fr: fr_messages.VSC_ACTIVE,
        tr: fr_messages.VSC_ACTIVE,
        pt: pt_messages.VSC_ACTIVE,
    }),

    VSC_NOT_ACTIVE: (): LocalizedMessageFunction => ({
        en: en_messages.VSC_NOT_ACTIVE,
        es: es_messages.VSC_NOT_ACTIVE,
        fr: fr_messages.VSC_NOT_ACTIVE,
        tr: fr_messages.VSC_NOT_ACTIVE,
        pt: pt_messages.VSC_NOT_ACTIVE,
    }),

    DISCORD_INVITE: (): LocalizedMessageFunction => ({
        en: en_messages.DISCORD_INVITE,
        es: es_messages.DISCORD_INVITE,
        fr: fr_messages.DISCORD_INVITE,
        tr: fr_messages.DISCORD_INVITE,
        pt: pt_messages.DISCORD_INVITE,
    }),

    LEAGUE_INVITE: (): LocalizedMessageFunction => ({
        en: en_messages.LEAGUE_INVITE,
        es: es_messages.LEAGUE_INVITE,
        fr: fr_messages.LEAGUE_INVITE,
        tr: fr_messages.LEAGUE_INVITE,
        pt: pt_messages.LEAGUE_INVITE,
    }),

    NO_MANUAL_MAPS: (): LocalizedMessageFunction => ({
        en: en_messages.NO_MANUAL_MAPS,
        es: es_messages.NO_MANUAL_MAPS,
        fr: fr_messages.NO_MANUAL_MAPS,
        tr: fr_messages.NO_MANUAL_MAPS,
        pt: pt_messages.NO_MANUAL_MAPS,
    }),

    INFINITE_QUALI: (): LocalizedMessageFunction => ({
        en: en_messages.INFINITE_QUALI,
        es: es_messages.INFINITE_QUALI,
        fr: fr_messages.INFINITE_QUALI,
        tr: fr_messages.INFINITE_QUALI,
        pt: pt_messages.INFINITE_QUALI,
    }),

    QUALI_TIME: (minutes: number): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.QUALI_TIME, {minutes: minutes.toString()}),
        es: replaceTemplateString(es_messages.QUALI_TIME, {minutes: minutes.toString()}),
        fr: replaceTemplateString(fr_messages.QUALI_TIME, {minutes: minutes.toString()}),
        tr: replaceTemplateString(tr_messages.QUALI_TIME, {minutes: minutes.toString()}),
        pt: replaceTemplateString(pt_messages.QUALI_TIME, {minutes: minutes.toString()}),
    }),

    NOT_IN_QUALI: (): LocalizedMessageFunction => ({
        en: en_messages.NOT_IN_QUALI,
        es: es_messages.NOT_IN_QUALI,
        fr: fr_messages.NOT_IN_QUALI,
        tr: fr_messages.NOT_IN_QUALI,
        pt: pt_messages.NOT_IN_QUALI,
    }),

    INVALID_TIME: (): LocalizedMessageFunction => ({
        en: en_messages.INVALID_TIME,
        es: es_messages.INVALID_TIME,
        fr: fr_messages.INVALID_TIME,
        tr: fr_messages.INVALID_TIME,
        pt: pt_messages.INVALID_TIME,
    }),

    QUALIFICATION_MODE: (): LocalizedMessageFunction => ({
        en: en_messages.QUALIFICATION_MODE,
        es: es_messages.QUALIFICATION_MODE,
        fr: fr_messages.QUALIFICATION_MODE,
        tr: fr_messages.QUALIFICATION_MODE,
        pt: pt_messages.QUALIFICATION_MODE,
    }),

    RACING_MODE: (): LocalizedMessageFunction => ({
        en: en_messages.RACING_MODE,
        es: es_messages.RACING_MODE,
        fr: fr_messages.RACING_MODE,
        tr: fr_messages.RACING_MODE,
        pt: pt_messages.RACING_MODE,
    }),

    JOIN_MESSAGE: (): LocalizedMessageFunction => ({
        en: en_messages.JOIN_MESSAGE,
        es: es_messages.JOIN_MESSAGE,
        fr: fr_messages.JOIN_MESSAGE,
        tr: fr_messages.JOIN_MESSAGE,
        pt: pt_messages.JOIN_MESSAGE,
    }),

    QTIME_COMMAND_USAGE: (): LocalizedMessageFunction => ({
        en: en_messages.QTIME_COMMAND_USAGE,
        es: es_messages.QTIME_COMMAND_USAGE,
        fr: fr_messages.QTIME_COMMAND_USAGE,
        tr: fr_messages.QTIME_COMMAND_USAGE,
        pt: pt_messages.QTIME_COMMAND_USAGE,
    }),

    HELP: (): LocalizedMessageFunction => ({
        en: en_messages.HELP,
        es: es_messages.HELP,
        fr: fr_messages.HELP,
        tr: fr_messages.HELP,
        pt: pt_messages.HELP,
    }),

    CLEARED_BANS: (): LocalizedMessageFunction => ({
        en: en_messages.CLEARED_BANS,
        es: es_messages.CLEARED_BANS,
        fr: fr_messages.CLEARED_BANS,
        tr: fr_messages.CLEARED_BANS,
        pt: pt_messages.CLEARED_BANS,
    }),

    LAPS_USAGE: (): LocalizedMessageFunction => ({
        en: en_messages.LAPS_USAGE,
        es: es_messages.LAPS_USAGE,
        fr: fr_messages.LAPS_USAGE,
        tr: fr_messages.LAPS_USAGE,
        pt: pt_messages.LAPS_USAGE,
    }),

    LANG_USAGE: (): LocalizedMessageFunction => ({
        en: en_messages.LANG_USAGE,
        es: es_messages.LANG_USAGE,
        fr: fr_messages.LANG_USAGE,
        tr: fr_messages.LANG_USAGE,
        pt: pt_messages.LANG_USAGE,
    }),

    NOT_STARTED: (): LocalizedMessageFunction => ({
        en: en_messages.NOT_STARTED,
        es: es_messages.NOT_STARTED,
        fr: fr_messages.NOT_STARTED,
        tr: fr_messages.NOT_STARTED,
        pt: pt_messages.NOT_STARTED,
    }),

    CLEAR_TIME_USAGE: (): LocalizedMessageFunction => ({
        en: en_messages.CLEAR_TIME_USAGE,
        es: es_messages.CLEAR_TIME_USAGE,
        fr: fr_messages.CLEAR_TIME_USAGE,
        tr: fr_messages.CLEAR_TIME_USAGE,
        pt: pt_messages.CLEAR_TIME_USAGE,
    }),

    TIMES_IN_RACE: (): LocalizedMessageFunction => ({
        en: en_messages.TIMES_IN_RACE,
        es: es_messages.TIMES_IN_RACE,
        fr: fr_messages.TIMES_IN_RACE,
        tr: tr_messages.TIMES_IN_RACE,
        pt: pt_messages.TIMES_IN_RACE,
    }),

    NO_POSITIONS: (): LocalizedMessageFunction => ({
        en: en_messages.NO_POSITIONS,
        es: es_messages.NO_POSITIONS,
        fr: fr_messages.NO_POSITIONS,
        tr: fr_messages.NO_POSITIONS,
        pt: pt_messages.NO_POSITIONS,
    }),

    NO_WAIT_TIME: (): LocalizedMessageFunction => ({
        en: en_messages.NO_WAIT_TIME,
        es: es_messages.NO_WAIT_TIME,
        fr: fr_messages.NO_WAIT_TIME,
        tr: fr_messages.NO_WAIT_TIME,
        pt: pt_messages.NO_WAIT_TIME,
    }),
    QUALI_WONT_END: (): LocalizedMessageFunction => ({
        en: en_messages.QUALI_WONT_END,
        es: es_messages.QUALI_WONT_END,
        fr: fr_messages.QUALI_WONT_END,
        tr: fr_messages.QUALI_WONT_END,
        pt: pt_messages.QUALI_WONT_END,
    }),
    QUALI_WILL_END_IN: (timeLeft: string): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.QUALI_WILL_END_IN, {timeLeft: timeLeft}),
        es: replaceTemplateString(es_messages.QUALI_WILL_END_IN, {timeLeft: timeLeft}),
        fr: replaceTemplateString(fr_messages.QUALI_WILL_END_IN, {timeLeft: timeLeft}),
        tr: replaceTemplateString(tr_messages.QUALI_WILL_END_IN, {timeLeft: timeLeft}),
        pt: replaceTemplateString(pt_messages.QUALI_WILL_END_IN, {timeLeft: timeLeft}),
    }),
    RACE_WILL_END_IN: (laps: number): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.RACE_WILL_END_IN, {laps: laps.toString()}),
        es: replaceTemplateString(es_messages.RACE_WILL_END_IN, {laps: laps.toString()}),
        fr: replaceTemplateString(fr_messages.RACE_WILL_END_IN, {laps: laps.toString()}),
        tr: replaceTemplateString(tr_messages.RACE_WILL_END_IN, {laps: laps.toString()}),
        pt: replaceTemplateString(pt_messages.RACE_WILL_END_IN, {laps: laps.toString()}),
    }),
    POSITIONS_IN_QUALI: (): LocalizedMessageFunction => ({
        en: en_messages.POSITIONS_IN_QUALI,
        es: es_messages.POSITIONS_IN_QUALI,
        fr: fr_messages.POSITIONS_IN_QUALI,
        tr: fr_messages.POSITIONS_IN_QUALI,
        pt:pt_messages.POSITIONS_IN_QUALI,
    }),
    LAPS_IN_QUALI: (): LocalizedMessageFunction => ({
        en: en_messages.LAPS_IN_QUALI,
        es: es_messages.LAPS_IN_QUALI,
        fr: fr_messages.LAPS_IN_QUALI,
        tr: fr_messages.LAPS_IN_QUALI,
        pt: pt_messages.LAPS_IN_QUALI,
    }),
    LAPS_CHANGED_TO: (laps: number): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.LAPS_CHANGED_TO, {laps: laps.toString()}),
        es: replaceTemplateString(es_messages.LAPS_CHANGED_TO, {laps: laps.toString()}),
        fr: replaceTemplateString(fr_messages.LAPS_CHANGED_TO, {laps: laps.toString()}),
        tr: replaceTemplateString(tr_messages.LAPS_CHANGED_TO, {laps: laps.toString()}),
        pt: replaceTemplateString(pt_messages.LAPS_CHANGED_TO, {laps: laps.toString()}),
    }),
    NO_TIMES: (): LocalizedMessageFunction => ({
        en: en_messages.NO_TIMES,
        es: es_messages.NO_TIMES,
        fr: fr_messages.NO_TIMES,
        tr: fr_messages.NO_TIMES,
        pt: pt_messages.NO_TIMES,
    }),
    ADMIN_AFK_WARNING: (): LocalizedMessageFunction => ({
        en: en_messages.ADMIN_AFK_WARNING,
        es: es_messages.ADMIN_AFK_WARNING,
        fr: fr_messages.ADMIN_AFK_WARNING,
        tr: fr_messages.ADMIN_AFK_WARNING,
        pt: pt_messages.ADMIN_AFK_WARNING,
    }),
    LAP_TIME: (time: number): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.LAP_TIME, {time: time.toString()}),
        es: replaceTemplateString(es_messages.LAP_TIME, {time: time.toString()}),
        fr: replaceTemplateString(fr_messages.LAP_TIME, {time: time.toString()}),
        tr: replaceTemplateString(tr_messages.LAP_TIME, {time: time.toString()}),
        pt: replaceTemplateString(pt_messages.LAP_TIME, {time: time.toString()}),
    }),
    LAP_TIME_FROM: (time: number, player: string): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.LAP_TIME_FROM, {time: time.toString(), player}),
        es: replaceTemplateString(es_messages.LAP_TIME_FROM, {time: time.toString(), player}),
        fr: replaceTemplateString(fr_messages.LAP_TIME_FROM, {time: time.toString(), player}),
        tr: replaceTemplateString(tr_messages.LAP_TIME_FROM, {time: time.toString(), player}),
        pt: replaceTemplateString(pt_messages.LAP_TIME_FROM, {time: time.toString(), player}),
    }),
    TROLLING_DETECTED: (): LocalizedMessageFunction => ({
        en: en_messages.TROLLING_DETECTED,
        es: es_messages.TROLLING_DETECTED,
        fr: fr_messages.TROLLING_DETECTED,
        tr: fr_messages.TROLLING_DETECTED,
        pt: pt_messages.TROLLING_DETECTED,
    }),
    TRACK_RECORD: (name: string, time: number): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.TRACK_RECORD, {name: name, time: time.toString()}),
        es: replaceTemplateString(es_messages.TRACK_RECORD, {name: name, time: time.toString()}),
        fr: replaceTemplateString(fr_messages.TRACK_RECORD, {name: name, time: time.toString()}),
        tr: replaceTemplateString(tr_messages.TRACK_RECORD, {name: name, time: time.toString()}),
        pt: replaceTemplateString(pt_messages.TRACK_RECORD, {name: name, time: time.toString()}),
    }),
    FINISH_RACE: (): LocalizedMessageFunction => ({
        en: en_messages.FINISH_RACE,
        es: es_messages.FINISH_RACE,
        fr: fr_messages.FINISH_RACE,
        tr: tr_messages.FINISH_RACE,
        pt: pt_messages.FINISH_RACE,
    }),
    FINISH_QUALI: (): LocalizedMessageFunction => ({
        en: en_messages.FINISH_QUALI,
        es: es_messages.FINISH_QUALI,
        fr: fr_messages.FINISH_QUALI,
        tr: tr_messages.FINISH_QUALI,
        pt: pt_messages.FINISH_QUALI,
    }),
    CURRENT_LAP: (currentLap: number, laps: number): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.CURRENT_LAP, {currentLap: currentLap.toString(), laps: laps.toString()}),
        es: replaceTemplateString(es_messages.CURRENT_LAP, {currentLap: currentLap.toString(), laps: laps.toString()}),
        fr: replaceTemplateString(fr_messages.CURRENT_LAP, {currentLap: currentLap.toString(), laps: laps.toString()}),
        tr: replaceTemplateString(tr_messages.CURRENT_LAP, {currentLap: currentLap.toString(), laps: laps.toString()}),
        pt: replaceTemplateString(pt_messages.CURRENT_LAP, {currentLap: currentLap.toString(), laps: laps.toString()}),
    }),
    POSITION_AND_DISTANCE_AHEAD: (position: number, distance: number, unit: string): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.POSITION_AND_DISTANCE_AHEAD, {
            position: position.toString(),
            distance: distance.toString(),
            unit: unit
        }),
        es: replaceTemplateString(es_messages.POSITION_AND_DISTANCE_AHEAD, {
            position: position.toString(),
            distance: distance.toString(),
            unit: unit
        }),
        fr: replaceTemplateString(fr_messages.POSITION_AND_DISTANCE_AHEAD, {
            position: position.toString(),
            distance: distance.toString(),
            unit: unit
        }),
        tr: replaceTemplateString(tr_messages.POSITION_AND_DISTANCE_AHEAD, {
            position: position.toString(),
            distance: distance.toString(),
            unit: unit
        }),
        pt: replaceTemplateString(pt_messages.POSITION_AND_DISTANCE_AHEAD, {
            position: position.toString(),
            distance: distance.toString(),
            unit: unit
        }),
    }),
    RAIN_ONE_MINUTE: (): LocalizedMessageFunction => ({
        en: en_messages.RAIN_ONE_MINUTE,
        es: es_messages.RAIN_ONE_MINUTE,
        fr: fr_messages.RAIN_ONE_MINUTE,
        tr: tr_messages.RAIN_ONE_MINUTE,
        pt: pt_messages.RAIN_ONE_MINUTE,
    }),
    RAIN_STARTED: (): LocalizedMessageFunction => ({
        en: en_messages.RAIN_STARTED,
        es: es_messages.RAIN_STARTED,
        fr: fr_messages.RAIN_STARTED,
        tr: tr_messages.RAIN_STARTED,
        pt: pt_messages.RAIN_STARTED,
    }),
    RAIN_STARTING_IN: (number:number): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.RAIN_STARTING_IN, {number: number.toString()}),
        es: replaceTemplateString(es_messages.RAIN_STARTING_IN, {number: number.toString()}),
        fr: replaceTemplateString(fr_messages.RAIN_STARTING_IN, {number: number.toString()}),
        tr: replaceTemplateString(tr_messages.RAIN_STARTING_IN, {number: number.toString()}),
        pt: replaceTemplateString(pt_messages.RAIN_STARTING_IN, {number: number.toString()}),
    }),
    RAIN_STOP_ONE_MINUTE: (): LocalizedMessageFunction => ({
        en: en_messages.RAIN_STOP_ONE_MINUTE,
        es: es_messages.RAIN_STOP_ONE_MINUTE,
        fr: fr_messages.RAIN_STOP_ONE_MINUTE,
        tr: tr_messages.RAIN_STOP_ONE_MINUTE,
        pt: pt_messages.RAIN_STOP_ONE_MINUTE,
    }),
    RAIN_STOPPED: (): LocalizedMessageFunction => ({
        en: en_messages.RAIN_STOPPED,
        es: es_messages.RAIN_STOPPED,
        fr: fr_messages.RAIN_STOPPED,
        tr: tr_messages.RAIN_STOPPED,
        pt: pt_messages.RAIN_STOPPED,
    }),
    RAIN_STOPING_IN: (number:number): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.RAIN_STOPING_IN, {number: number.toString()}),
        es: replaceTemplateString(es_messages.RAIN_STOPING_IN, {number: number.toString()}),
        fr: replaceTemplateString(fr_messages.RAIN_STOPING_IN, {number: number.toString()}),
        tr: replaceTemplateString(tr_messages.RAIN_STOPING_IN, {number: number.toString()}),
        pt: replaceTemplateString(pt_messages.RAIN_STOPING_IN, {number: number.toString()}),
    }),
    RAIN_CHANCES: (number:number): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.RAIN_CHANCES, {number: number.toString()}),
        es: replaceTemplateString(es_messages.RAIN_CHANCES, {number: number.toString()}),
        fr: replaceTemplateString(fr_messages.RAIN_CHANCES, {number: number.toString()}),
        tr: replaceTemplateString(tr_messages.RAIN_CHANCES, {number: number.toString()}),
        pt: replaceTemplateString(pt_messages.RAIN_CHANCES, {number: number.toString()}),
    }),
    NEW_RAIN_INTENSITY: (number:number): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.RAIN_INTENSITY, {number: number.toString()}),
        es: replaceTemplateString(es_messages.RAIN_INTENSITY, {number: number.toString()}),
        fr: replaceTemplateString(fr_messages.RAIN_INTENSITY, {number: number.toString()}),
        tr: replaceTemplateString(tr_messages.RAIN_INTENSITY, {number: number.toString()}),
        pt: replaceTemplateString(pt_messages.RAIN_INTENSITY, {number: number.toString()}),
    }),
    RAIN_INTENSITY_LAP: (number:number): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.RAIN_INTENSITY, {number: number.toString()}),
        es: replaceTemplateString(es_messages.RAIN_INTENSITY, {number: number.toString()}),
        fr: replaceTemplateString(fr_messages.RAIN_INTENSITY, {number: number.toString()}),
        tr: replaceTemplateString(tr_messages.RAIN_INTENSITY, {number: number.toString()}),
        pt: replaceTemplateString(pt_messages.RAIN_INTENSITY, {number: number.toString()}),
    }),
    IN_MUTE_MODE: (): LocalizedMessageFunction => ({
        en: en_messages.IN_MUTE_MODE,
        es: es_messages.IN_MUTE_MODE,
        fr: fr_messages.IN_MUTE_MODE,
        tr: fr_messages.IN_MUTE_MODE,
        pt: pt_messages.IN_MUTE_MODE,
    }),
    TYRE_WEAR_LAP: (number:number): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.TYRE_WEAR_LAP, {number: number.toString()}),
        es: replaceTemplateString(es_messages.TYRE_WEAR_LAP, {number: number.toString()}),
        fr: replaceTemplateString(fr_messages.TYRE_WEAR_LAP, {number: number.toString()}),
        tr: replaceTemplateString(tr_messages.TYRE_WEAR_LAP, {number: number.toString()}),
        pt: replaceTemplateString(pt_messages.TYRE_WEAR_LAP, {number: number.toString()}),
    }),
    AFK_MESSAGE: (): LocalizedMessageFunction => ({
        en: en_messages.AFK_MESSAGE,
        es: es_messages.AFK_MESSAGE,
        fr: fr_messages.AFK_MESSAGE,
        tr: fr_messages.AFK_MESSAGE,
        pt: pt_messages.AFK_MESSAGE,
    }),
    NOW_AFK: (): LocalizedMessageFunction => ({
        en: en_messages.NOW_AFK,
        es: es_messages.NOW_AFK,
        fr: fr_messages.NOW_AFK,
        tr: fr_messages.NOW_AFK,
        pt: pt_messages.NOW_AFK,
    }),
    REMOVED_FROM_AFK: (): LocalizedMessageFunction => ({
        en: en_messages.REMOVED_FROM_AFK,
        es: es_messages.REMOVED_FROM_AFK,
        fr: fr_messages.REMOVED_FROM_AFK,
        tr: fr_messages.REMOVED_FROM_AFK,
        pt: pt_messages.REMOVED_FROM_AFK,
    }),
    ENABLED_TYRES: (boolean:boolean): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.ENABLED_TYRES, {boolean: boolean.toString()}),
        es: replaceTemplateString(es_messages.ENABLED_TYRES, {boolean: boolean.toString()}),
        fr: replaceTemplateString(fr_messages.ENABLED_TYRES, {boolean: boolean.toString()}),
        tr: replaceTemplateString(tr_messages.ENABLED_TYRES, {boolean: boolean.toString()}),
        pt: replaceTemplateString(pt_messages.ENABLED_TYRES, {boolean: boolean.toString()}),
    }),
    TIPS: (): LocalizedMessageFunction => ({
        en: en_messages.TIPS,
        es: es_messages.TIPS,
        fr: fr_messages.TIPS,
        tr: fr_messages.TIPS,
        pt: pt_messages.TIPS,
    }),
    EXPLAIN_TYRES: (): LocalizedMessageFunction => ({
        en: en_messages.EXPLAIN_TYRES,
        es: es_messages.EXPLAIN_TYRES,
        fr: fr_messages.EXPLAIN_TYRES,
        tr: fr_messages.EXPLAIN_TYRES,
        pt: pt_messages.EXPLAIN_TYRES,
    }),
    EXPLAIN_RAIN: (): LocalizedMessageFunction => ({
        en: en_messages.EXPLAIN_RAIN,
        es: es_messages.EXPLAIN_RAIN,
        fr: fr_messages.EXPLAIN_RAIN,
        tr: fr_messages.EXPLAIN_RAIN,
        pt: pt_messages.EXPLAIN_RAIN,
    }),
    EXPLAIN_ERS: (): LocalizedMessageFunction => ({
        en: en_messages.EXPLAIN_ERS,
        es: es_messages.EXPLAIN_ERS,
        fr: fr_messages.EXPLAIN_ERS,
        tr: fr_messages.EXPLAIN_ERS,
        pt: pt_messages.EXPLAIN_ERS,
    }),
    GREEN_FLAG: (): LocalizedMessageFunction => ({
        en: en_messages.GREEN_FLAG,
        es: es_messages.GREEN_FLAG,
        fr: fr_messages.GREEN_FLAG,
        tr: tr_messages.GREEN_FLAG,
        pt: pt_messages.GREEN_FLAG,
    }),
    GREEN_FLAG_TWO: (): LocalizedMessageFunction => ({
        en: en_messages.GREEN_FLAG_TWO,
        es: es_messages.GREEN_FLAG_TWO,
        fr: fr_messages.GREEN_FLAG_TWO,
        tr: tr_messages.GREEN_FLAG_TWO,
        pt: pt_messages.GREEN_FLAG_TWO,
    }),
    YELLOW_FLAG: (): LocalizedMessageFunction => ({
        en: en_messages.YELLOW_FLAG,
        es: es_messages.YELLOW_FLAG,
        fr: fr_messages.YELLOW_FLAG,
        tr: tr_messages.YELLOW_FLAG,
        pt: pt_messages.YELLOW_FLAG,
    }),
    YELLOW_FLAG_TWO: (): LocalizedMessageFunction => ({
        en: en_messages.YELLOW_FLAG_TWO,
        es: es_messages.YELLOW_FLAG_TWO,
        fr: fr_messages.YELLOW_FLAG_TWO,
        tr: tr_messages.YELLOW_FLAG_TWO,
        pt: pt_messages.YELLOW_FLAG_TWO,
    }),
    RED_FLAG: (): LocalizedMessageFunction => ({
        en: en_messages.RED_FLAG,
        es: es_messages.RED_FLAG,
        fr: fr_messages.RED_FLAG,
        tr: tr_messages.RED_FLAG,
        pt: pt_messages.RED_FLAG,
    }),
    RED_FLAG_TWO: (): LocalizedMessageFunction => ({
        en: en_messages.RED_FLAG_TWO,
        es: es_messages.RED_FLAG_TWO,
        fr: fr_messages.RED_FLAG_TWO,
        tr: tr_messages.RED_FLAG_TWO,
        pt: pt_messages.RED_FLAG_TWO,
    }),
    BLUE_FLAG: (citedPlayer:string): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.BLUE_FLAG, {citedPlayer: citedPlayer}),
        es: replaceTemplateString(es_messages.BLUE_FLAG, {citedPlayer: citedPlayer}),
        fr: replaceTemplateString(fr_messages.BLUE_FLAG, {citedPlayer: citedPlayer}),
        tr: replaceTemplateString(tr_messages.BLUE_FLAG, {citedPlayer: citedPlayer}),
        pt: replaceTemplateString(pt_messages.BLUE_FLAG, {citedPlayer: citedPlayer}),
    }),
    BLUE_FLAG_TWO: (citedPlayer:string): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.BLUE_FLAG_TWO, {citedPlayer: citedPlayer}),
        es: replaceTemplateString(es_messages.BLUE_FLAG_TWO, {citedPlayer: citedPlayer}),
        fr: replaceTemplateString(fr_messages.BLUE_FLAG_TWO, {citedPlayer: citedPlayer}),
        tr: replaceTemplateString(tr_messages.BLUE_FLAG_TWO, {citedPlayer: citedPlayer}),
        pt: replaceTemplateString(pt_messages.BLUE_FLAG_TWO, {citedPlayer: citedPlayer}),
    }),
    BLACK_FLAG: (citedPlayer:string): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.BLACK_FLAG, {citedPlayer: citedPlayer}),
        es: replaceTemplateString(es_messages.BLACK_FLAG, {citedPlayer: citedPlayer}),
        fr: replaceTemplateString(fr_messages.BLACK_FLAG, {citedPlayer: citedPlayer}),
        tr: replaceTemplateString(tr_messages.BLACK_FLAG, {citedPlayer: citedPlayer}),
        pt: replaceTemplateString(pt_messages.BLACK_FLAG, {citedPlayer: citedPlayer}),
    }),
    BLACK_FLAG_TWO: (citedPlayer:string): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.BLACK_FLAG_TWO, {citedPlayer: citedPlayer}),
        es: replaceTemplateString(es_messages.BLACK_FLAG_TWO, {citedPlayer: citedPlayer}),
        fr: replaceTemplateString(fr_messages.BLACK_FLAG_TWO, {citedPlayer: citedPlayer}),
        tr: replaceTemplateString(tr_messages.BLACK_FLAG_TWO, {citedPlayer: citedPlayer}),
        pt: replaceTemplateString(pt_messages.BLACK_FLAG_TWO, {citedPlayer: citedPlayer}),
    }),
    NOT_VOTE: (): LocalizedMessageFunction => ({
        en: en_messages.NOT_VOTE,
        es: es_messages.NOT_VOTE,
        fr: fr_messages.NOT_VOTE,
        tr: tr_messages.NOT_VOTE,
        pt: pt_messages.NOT_VOTE,
    }),
    ALREADY_VOTE: (): LocalizedMessageFunction => ({
        en: en_messages.ALREADY_VOTE,
        es: es_messages.ALREADY_VOTE,
        fr: fr_messages.ALREADY_VOTE,
        tr: tr_messages.ALREADY_VOTE,
        pt: pt_messages.ALREADY_VOTE,
    }),
    INVALIDE_VOTE: (): LocalizedMessageFunction => ({
        en: en_messages.INVALIDE_VOTE,
        es: es_messages.INVALIDE_VOTE,
        fr: fr_messages.INVALIDE_VOTE,
        tr: tr_messages.INVALIDE_VOTE,
        pt: pt_messages.INVALIDE_VOTE,
    }),
    VOTED: (circuit: string): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.VOTED, { circuit }),
        es: replaceTemplateString(es_messages.VOTED, { circuit }),
        fr: replaceTemplateString(fr_messages.VOTED, { circuit }),
        tr: replaceTemplateString(tr_messages.VOTED, { circuit }),
        pt: replaceTemplateString(pt_messages.VOTED, { circuit }),
    }),
    CIRCUIT_CHOOSED: (circuit: string, votes: number): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.CIRCUIT_CHOOSED, { circuit, votes:votes.toString() }),
        es: replaceTemplateString(es_messages.CIRCUIT_CHOOSED, { circuit, votes:votes.toString() }),
        fr: replaceTemplateString(fr_messages.CIRCUIT_CHOOSED, { circuit, votes:votes.toString() }),
        tr: replaceTemplateString(tr_messages.CIRCUIT_CHOOSED, { circuit, votes:votes.toString() }),
        pt: replaceTemplateString(pt_messages.CIRCUIT_CHOOSED, { circuit, votes:votes.toString() }),
    }),
    TIME_TO_VOTE: (): LocalizedMessageFunction => ({
        en: en_messages.TIME_TO_VOTE,
        es: es_messages.TIME_TO_VOTE,
        fr: fr_messages.TIME_TO_VOTE,
        tr: tr_messages.TIME_TO_VOTE,
        pt: pt_messages.TIME_TO_VOTE,
    }),
    TIME_TO_QUALY: (): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.TIME_TO_QUALY, {}),
        es: replaceTemplateString(es_messages.TIME_TO_QUALY, {}),
        fr: replaceTemplateString(fr_messages.TIME_TO_QUALY, {}),
        tr: replaceTemplateString(tr_messages.TIME_TO_QUALY, {}),
        pt: replaceTemplateString(pt_messages.TIME_TO_QUALY, {}),
    }),
    
    TIME_TO_RACE: (laps:number): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.TIME_TO_RACE, {laps: laps.toString()}),
        es: replaceTemplateString(es_messages.TIME_TO_RACE, {laps: laps.toString()}),
        fr: replaceTemplateString(fr_messages.TIME_TO_RACE, {laps: laps.toString()}),
        tr: replaceTemplateString(tr_messages.TIME_TO_RACE, {laps: laps.toString()}),
        pt: replaceTemplateString(pt_messages.TIME_TO_RACE, {laps: laps.toString()}),
    }),
    
    WORSE_TIME: (lapTime: number, diferenca: number): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.WORSE_TIME, { lapTime:lapTime.toString(), diferenca: diferenca.toString() }),
        es: replaceTemplateString(es_messages.WORSE_TIME, { lapTime:lapTime.toString(), diferenca: diferenca.toString() }),
        fr: replaceTemplateString(fr_messages.WORSE_TIME, { lapTime:lapTime.toString(), diferenca: diferenca.toString() }),
        tr: replaceTemplateString(tr_messages.WORSE_TIME, { lapTime:lapTime.toString(), diferenca: diferenca.toString() }),
        pt: replaceTemplateString(pt_messages.WORSE_TIME, { lapTime:lapTime.toString(), diferenca: diferenca.toString() }),
    }),
    
    CODE_BOX: (codigo: number): LocalizedMessageFunction => ({
        en: replaceTemplateString(en_messages.CODE_BOX, { codigo:codigo.toString()}),
        es: replaceTemplateString(es_messages.CODE_BOX, { codigo:codigo.toString()}),
        fr: replaceTemplateString(fr_messages.CODE_BOX, { codigo:codigo.toString()}),
        tr: replaceTemplateString(tr_messages.CODE_BOX, { codigo:codigo.toString()}),
        pt: replaceTemplateString(pt_messages.CODE_BOX, { codigo:codigo.toString()}),
    }),
    CODE_WRONG: (): LocalizedMessageFunction => ({
        en: en_messages.CODE_WRONG,
        es: es_messages.CODE_WRONG,
        fr: fr_messages.CODE_WRONG,
        tr: tr_messages.CODE_WRONG,
        pt: pt_messages.CODE_WRONG,
    }),
    
};