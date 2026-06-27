export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    // Pega as permissões do usuário logado na sessão
    const permissions = req.session.permissions;

    // Verifica se a permissão exigida existe e é verdadeira
    if (!permissions || permissions[requiredPermission] !== true) {
      // Se ele não tiver acesso, você pode redirecionar ou mandar erro
      return res
        .status(403)
        .send(
          "Acesso negado: Você não tem permissão para acessar esta página.",
        );
    }

    // Se tiver acesso, a requisição continua normalmente
    next();
  };
};
