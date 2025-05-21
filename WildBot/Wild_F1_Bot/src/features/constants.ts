
export const constants = {
    // ===============================
    // Velocidade e Performance Base
    // ===============================
    NORMAL_SPEED: 1,
    DRS_SPEED_GAIN: 0.001,
    ERS_PENALTY: -0.006,
    JUMP_START_PENALTY: -0.005,
    FULL_GAS_SPEED: 0.00025,
    ZERO_GAS_PENALTY: 0.005,

    // ===============================
    // Pitlane e Safety Car
    // ===============================
    DEFAULT_PIT_SPEED: 0.95,
    SAFETY_CAR_SPEED: 0.985,
    SAFETY_CAR_INDY_SPEED: 0.993,

    // ===============================
    // Slipstream (vácuo)
    // ===============================
    // Quando mudar MAX_SLIPSTREAM, mudar também a velocidade segurando X em indianapolis
    MAX_SLIPSTREAM: 0.0001,              // Ganho máximo possível com slipstream
    RESIDUAL_SLIPSTREAM_TIME: 2,         // Tempo (s) de slipstream residual
    SLIPSTREAM_RESIDUAL_VALUE: 0.0002 * 0.2,  // Valor do efeito residual
    SLIPSTREAM_ACTIVATION_DISTANCE: 500, // Distância máxima para ativar efeito
    SLIPSTREAM_LATERAL_TOLERANCE: 38,    // Largura lateral máxima para efeito

    // ===============================
    // Chuva e Aderência
    // ===============================
    SLIDE_FACTOR: 2.5                    // Multiplicador de deslizamento na chuva
}


export function changeConstant(key: keyof typeof constants, value: number) {
    if (key in constants) {
        constants[key] = value
    }
}