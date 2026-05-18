import { Request } from 'express';

export type Language = 'pt' | 'en' | 'es';
export const DEFAULT_LANGUAGE: Language = 'pt';

const exactMessages = {
  pt: {
    'Validation failed': 'Falha na validação',
    'Access token required': 'Token de acesso obrigatório',
    'Invalid or expired token': 'Token inválido ou expirado',
    'Authentication failed': 'Falha na autenticação',
    'Authentication required': 'Autenticação obrigatória',
    'Insufficient permissions': 'Permissões insuficientes',
    'User not authenticated': 'Usuário não autenticado',
    'User not found': 'Usuário não encontrado',
    'Internal server error': 'Erro interno do servidor',
    'Internal Server Error': 'Erro interno do servidor',
    'Invalid username or password': 'Usuário ou senha inválidos',
    'Internal server error during login': 'Erro interno do servidor durante o login',
    'Login successful': 'Login realizado com sucesso',
    'Logout successful': 'Logout realizado com sucesso',
    'User created successfully': 'Usuário criado com sucesso',
    'Username already exists': 'Nome de usuário já existe',
    'Failed to create user': 'Falha ao criar usuário',
    'Failed to list users': 'Falha ao listar usuários',
    'Failed to update user': 'Falha ao atualizar usuário',
    'Failed to delete user': 'Falha ao excluir usuário',
    'You cannot delete your own user': 'Você não pode excluir o próprio usuário',
    'Failed to list scuderias': 'Falha ao listar scuderias',
    'Failed to create scuderia': 'Falha ao criar scuderia',
    'Failed to update scuderia': 'Falha ao atualizar scuderia',
    'Failed to delete scuderia': 'Falha ao excluir scuderia',
    'Scuderia name or abbreviation already exists': 'Nome ou abreviação da scuderia já existe',
    'Scuderia not found': 'Scuderia não encontrada',
    'No current map found': 'Nenhum mapa atual encontrado',
    'Room state not available': 'Estado da sala indisponível',
    'Map name is required': 'Nome do mapa é obrigatório',
    'Map updated successfully': 'Mapa atualizado com sucesso',
    'Too many requests from this IP, please try again later.': 'Muitas requisições deste IP. Tente novamente mais tarde.',
    'Invalid Content-Type. Expected application/json': 'Content-Type inválido. Esperado application/json',
    'User or upgrade not found': 'Usuário ou melhoria não encontrada',
    'Insufficient funds': 'Saldo insuficiente',
    'Upgrade already purchased': 'Melhoria já comprada',
    'Upgrade ID must be a valid UUID': 'O ID da melhoria deve ser um UUID válido',
    'Invalid user id': 'ID de usuário inválido',
    'Invalid scuderia id': 'ID de scuderia inválido',
    'Token is valid': 'Token válido',
    'Upgrade purchased successfully': 'Melhoria comprada com sucesso',
    'Failed to purchase upgrade': 'Falha ao comprar melhoria',
    'Upgrade not found in your collection': 'Melhoria não encontrada na sua coleção',
    'Failed to equip upgrade': 'Falha ao equipar melhoria',
    'Failed to remove upgrade': 'Falha ao remover melhoria',
    'Username must be between 3 and 50 characters': 'O nome de usuário deve ter entre 3 e 50 caracteres',
    'Username can only contain letters, numbers, underscores, and internal spaces': 'O nome de usuário só pode conter letras, números, underscores e espaços internos',
    'Password must be at least 6 characters long': 'A senha deve ter pelo menos 6 caracteres',
    'Short username must be between 1 and 3 characters': 'O usuário curto deve ter entre 1 e 3 caracteres',
    'Short username can only contain uppercase letters and numbers': 'O usuário curto só pode conter letras maiúsculas e números',
    'At least one user function must be selected': 'Selecione pelo menos uma função do usuário',
    'Team must be a valid UUID when provided': 'O time deve ser um UUID válido quando informado',
    'Team memberships must be an array': 'As relações com scuderias devem ser uma lista',
    'Team membership role is invalid': 'A função na scuderia é inválida',
    'A user cannot have duplicate scuderias': 'Um usuário não pode ter scuderias duplicadas',
    'Driver number must be between 0 and 999': 'O número do piloto deve estar entre 0 e 999',
    'Language must be pt, en, or es': 'O idioma deve ser pt, en ou es',
    'Scuderia name must be between 2 and 100 characters': 'O nome da scuderia deve ter entre 2 e 100 caracteres',
    'Scuderia abbreviation must be exactly 3 characters': 'A abreviação da scuderia deve ter exatamente 3 caracteres',
    'Scuderia abbreviation can only contain uppercase letters and numbers': 'A abreviação da scuderia só pode conter letras maiúsculas e números',
    'Scuderia color must be a valid hex color': 'A cor da scuderia deve ser um hexadecimal válido',
    'Finance amount must be greater than zero': 'O valor financeiro deve ser maior que zero',
    'Finance entry type is invalid': 'O tipo de lançamento financeiro é inválido',
    'Finance reason must be between 2 and 255 characters': 'O motivo financeiro deve ter entre 2 e 255 caracteres',
    'Finance date must be a valid ISO date': 'A data financeira deve ser uma data ISO válida',
    'Finance entry created successfully': 'Lançamento financeiro criado com sucesso',
    'Failed to create finance entry': 'Falha ao criar lançamento financeiro',
    'Sponsor logo URL must point to a PNG image': 'A URL da logo do sponsor deve apontar para uma imagem PNG',
    'Sponsor not found': 'Sponsor não encontrado',
    'Sponsor already assigned to scuderia': 'Sponsor já atribuído à scuderia',
    'Sponsor category is full': 'A categoria de sponsor já está cheia',
  },
  en: {},
  es: {
    'Validation failed': 'La validación falló',
    'Access token required': 'Se requiere token de acceso',
    'Invalid or expired token': 'Token inválido o expirado',
    'Authentication failed': 'Falló la autenticación',
    'Authentication required': 'Autenticación obligatoria',
    'Insufficient permissions': 'Permisos insuficientes',
    'User not authenticated': 'Usuario no autenticado',
    'User not found': 'Usuario no encontrado',
    'Internal server error': 'Error interno del servidor',
    'Internal Server Error': 'Error interno del servidor',
    'Invalid username or password': 'Usuario o contraseña inválidos',
    'Internal server error during login': 'Error interno del servidor durante el inicio de sesión',
    'Login successful': 'Inicio de sesión correcto',
    'Logout successful': 'Sesión cerrada correctamente',
    'User created successfully': 'Usuario creado correctamente',
    'Username already exists': 'El nombre de usuario ya existe',
    'Failed to create user': 'No se pudo crear el usuario',
    'Failed to list users': 'No se pudieron listar los usuarios',
    'Failed to update user': 'No se pudo actualizar el usuario',
    'Failed to delete user': 'No se pudo eliminar el usuario',
    'You cannot delete your own user': 'No puedes eliminar tu propio usuario',
    'Failed to list scuderias': 'No se pudieron listar las scuderias',
    'Failed to create scuderia': 'No se pudo crear la scuderia',
    'Failed to update scuderia': 'No se pudo actualizar la scuderia',
    'Failed to delete scuderia': 'No se pudo eliminar la scuderia',
    'Scuderia name or abbreviation already exists': 'El nombre o la abreviación de la scuderia ya existe',
    'Scuderia not found': 'Scuderia no encontrada',
    'No current map found': 'No se encontró un mapa actual',
    'Room state not available': 'Estado de la sala no disponible',
    'Map name is required': 'El nombre del mapa es obligatorio',
    'Map updated successfully': 'Mapa actualizado correctamente',
    'Too many requests from this IP, please try again later.': 'Demasiadas solicitudes desde esta IP. Inténtalo de nuevo más tarde.',
    'Invalid Content-Type. Expected application/json': 'Content-Type inválido. Se esperaba application/json',
    'User or upgrade not found': 'Usuario o mejora no encontrada',
    'Insufficient funds': 'Fondos insuficientes',
    'Upgrade already purchased': 'Mejora ya comprada',
    'Upgrade ID must be a valid UUID': 'El ID de la mejora debe ser un UUID válido',
    'Invalid user id': 'ID de usuario inválido',
    'Invalid scuderia id': 'ID de scuderia inválido',
    'Token is valid': 'Token válido',
    'Upgrade purchased successfully': 'Mejora comprada correctamente',
    'Failed to purchase upgrade': 'No se pudo comprar la mejora',
    'Upgrade not found in your collection': 'Mejora no encontrada en tu colección',
    'Failed to equip upgrade': 'No se pudo equipar la mejora',
    'Failed to remove upgrade': 'No se pudo eliminar la mejora',
    'Username must be between 3 and 50 characters': 'El nombre de usuario debe tener entre 3 y 50 caracteres',
    'Username can only contain letters, numbers, underscores, and internal spaces': 'El nombre de usuario solo puede contener letras, números, guiones bajos y espacios internos',
    'Password must be at least 6 characters long': 'La contraseña debe tener al menos 6 caracteres',
    'Short username must be between 1 and 3 characters': 'El usuario corto debe tener entre 1 y 3 caracteres',
    'Short username can only contain uppercase letters and numbers': 'El usuario corto solo puede contener letras mayúsculas y números',
    'At least one user function must be selected': 'Debes seleccionar al menos una función del usuario',
    'Team must be a valid UUID when provided': 'El equipo debe ser un UUID válido cuando se informe',
    'Team memberships must be an array': 'Las relaciones con scuderias deben ser una lista',
    'Team membership role is invalid': 'La función en la scuderia no es válida',
    'A user cannot have duplicate scuderias': 'Un usuario no puede tener scuderias duplicadas',
    'Driver number must be between 0 and 999': 'El número del piloto debe estar entre 0 y 999',
    'Language must be pt, en, or es': 'El idioma debe ser pt, en o es',
    'Scuderia name must be between 2 and 100 characters': 'El nombre de la scuderia debe tener entre 2 y 100 caracteres',
    'Scuderia abbreviation must be exactly 3 characters': 'La abreviación de la scuderia debe tener exactamente 3 caracteres',
    'Scuderia abbreviation can only contain uppercase letters and numbers': 'La abreviación de la scuderia solo puede contener letras mayúsculas y números',
    'Scuderia color must be a valid hex color': 'El color de la scuderia debe ser un hexadecimal válido',
    'Finance amount must be greater than zero': 'El valor financiero debe ser mayor que cero',
    'Finance entry type is invalid': 'El tipo de movimiento financiero no es válido',
    'Finance reason must be between 2 and 255 characters': 'El motivo financiero debe tener entre 2 y 255 caracteres',
    'Finance date must be a valid ISO date': 'La fecha financiera debe ser una fecha ISO válida',
    'Finance entry created successfully': 'Movimiento financiero creado correctamente',
    'Failed to create finance entry': 'No se pudo crear el movimiento financiero',
    'Sponsor logo URL must point to a PNG image': 'La URL del logo del sponsor debe apuntar a una imagen PNG',
    'Sponsor not found': 'Sponsor no encontrado',
    'Sponsor already assigned to scuderia': 'El sponsor ya está asignado a la scuderia',
    'Sponsor category is full': 'La categoría de sponsor ya está llena',
  },
} as const;

export function normalizeLanguage(language?: string | null): Language {
  return language === 'en' || language === 'es' || language === 'pt'
    ? language
    : DEFAULT_LANGUAGE;
}

export function getRequestLanguage(req: Request): Language {
  const requestUser = req.user as { language?: string } | undefined;
  const headerLanguage = req.header('x-language');
  return normalizeLanguage(requestUser?.language ?? headerLanguage);
}

export function translateMessage(message: string | undefined, language: Language): string | undefined {
  if (!message) return message;
  const exact = exactMessages[language][message as keyof typeof exactMessages[typeof language]];
  if (exact) return exact;

  const levelMatch = message.match(/^Level (\d+) required to purchase this upgrade$/);
  if (levelMatch) {
    if (language === 'pt') return `Nível ${levelMatch[1]} necessário para comprar esta melhoria`;
    if (language === 'es') return `Se requiere nivel ${levelMatch[1]} para comprar esta mejora`;
  }

  const equippedMatch = message.match(/^(.+) equipped successfully$/);
  if (equippedMatch) {
    if (language === 'pt') return `${equippedMatch[1]} equipada com sucesso`;
    if (language === 'es') return `${equippedMatch[1]} equipada correctamente`;
  }

  const removedMatch = message.match(/^(.+) removed\. Refunded: \$(\d+)$/);
  if (removedMatch) {
    if (language === 'pt') return `${removedMatch[1]} removida. Reembolso: $${removedMatch[2]}`;
    if (language === 'es') return `${removedMatch[1]} eliminada. Reembolso: $${removedMatch[2]}`;
  }

  const failedMissionMatch = message.match(/^Failed mission (.+)$/);
  if (failedMissionMatch) {
    if (language === 'pt') return `Falhou na missão ${failedMissionMatch[1]}`;
    if (language === 'es') return `Falló en la misión ${failedMissionMatch[1]}`;
  }

  return message;
}

export function translateValidationErrors<T extends { msg?: string }>(
  errors: T[],
  language: Language,
): T[] {
  return errors.map((error) => ({
    ...error,
    msg: translateMessage(error.msg, language) ?? error.msg,
  }));
}
