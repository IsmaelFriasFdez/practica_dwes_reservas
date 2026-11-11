// Avisos de un solo uso ("mensaje flash") guardados en la sesión.

export function redirigirConAviso(req, res, next, aviso, url) {
  req.session.aviso = aviso;
  req.session.save((err) => {
    if (err) return next(err);
    return res.redirect(303, url);
  });
}

export function consumirAviso(req, res, next) {
  res.locals.aviso = null;
  if (req.method === "GET" && req.session.aviso !== undefined) {
    res.locals.aviso = req.session.aviso;
    delete req.session.aviso;
  }
  return next();
}
