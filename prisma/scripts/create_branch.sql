-- Sucursal: propuesta independiente siguiendo las convenciones del esquema.
-- Ejecutar en PostgreSQL sobre la base de datos de la aplicacion.
BEGIN;

INSERT INTO public.cat_user_type (code, description)
VALUES ('ENCARGADO_SUCURSAL', 'Encargado de sucursal')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE public.branch (
    branch_id         SERIAL,
    code              VARCHAR(30) NOT NULL,
    name              VARCHAR(150) NOT NULL,
    address           VARCHAR(250),
    phone             VARCHAR(20),
    email             VARCHAR(150),
    fk_manager_user   INTEGER,
    latitude          NUMERIC(10, 7),
    longitude         NUMERIC(10, 7),
    schedule          VARCHAR(200),
    description       VARCHAR(500),
    status            BOOLEAN NOT NULL DEFAULT TRUE,
    registration_date TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_date       TIMESTAMPTZ(6),

    CONSTRAINT pk_branch PRIMARY KEY (branch_id),
    CONSTRAINT uk_branch_code UNIQUE (code),
    CONSTRAINT fk_branch_manager_user FOREIGN KEY (fk_manager_user)
        REFERENCES public.users (user_id) ON DELETE RESTRICT,
    CONSTRAINT ck_branch_code_not_blank CHECK (BTRIM(code) <> ''),
    CONSTRAINT ck_branch_name_not_blank CHECK (BTRIM(name) <> ''),
    CONSTRAINT ck_branch_latitude CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT ck_branch_longitude CHECK (longitude BETWEEN -180 AND 180),
    CONSTRAINT ck_branch_coordinates CHECK (
        (latitude IS NULL AND longitude IS NULL)
        OR (latitude IS NOT NULL AND longitude IS NOT NULL)
    )
);

CREATE INDEX idx_branch_status ON public.branch (status);
CREATE INDEX idx_branch_manager_user ON public.branch (fk_manager_user);

-- Al asignar un encargado, el servicio debe validar que el usuario este activo
-- y tenga el rol ENCARGADO_SUCURSAL activo en user_role y cat_user_type.
-- La FK permite un encargado por sucursal y varias sucursales por usuario.

-- Mantiene la fecha incluso cuando se actualiza mediante SQL directo.
CREATE FUNCTION public.set_branch_update_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.update_date := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_branch_update_date
BEFORE UPDATE ON public.branch
FOR EACH ROW
EXECUTE FUNCTION public.set_branch_update_date();

COMMIT;
