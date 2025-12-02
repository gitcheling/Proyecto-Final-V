const jwt = require('jsonwebtoken');
const { errorResponse } = require('../Utils/responses');

const autorizarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return errorResponse(res, 'Token no proporcionado', 401);
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return errorResponse(res, 'Token inválido o expirado', 403);
        }
        req.user = user;
        next();
    });
};

const autorizarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!rolesPermitidos.includes(req.user.rol)) {
            return errorResponse(res, 'No tienes permiso para realizar esta acción', 403);
        }
        next();
    };
}

module.exports = {
    autorizarToken,
    autorizarRol
};