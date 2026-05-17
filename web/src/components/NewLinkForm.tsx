import { zodResolver } from "@hookform/resolvers/zod";
import { SpinnerIcon, WarningIcon } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  originalUrl: z.url("Informe uma URL válida."),
  slug: z
    .string()
    .min(1, "Informe o encurtamento.")
    .regex(/^[a-zA-Z0-9_-]+$/, "Use apenas letras, números, _ e -."),
});

export type NewLinkFormValues = z.infer<typeof formSchema>;

interface NewLinkFormProps {
  onCreate: (values: NewLinkFormValues) => Promise<void>;
  isSubmitting: boolean;
  errorMessage?: string;
}

export function NewLinkForm({ onCreate, isSubmitting, errorMessage }: NewLinkFormProps) {
  const shortBase = import.meta.env.VITE_SHORT_BASE_URL ?? "brev.ly";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<NewLinkFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      originalUrl: "",
      slug: "",
    },
  });

  async function onSubmit(values: NewLinkFormValues) {
    await onCreate(values);
    reset();
  }

  return (
    <section className="panel">
      <h2 className="panel-title">Novo link</h2>

      <form className="new-link-form" onSubmit={handleSubmit(onSubmit)}>
        <label className={`input-group${errors.originalUrl ? " has-error" : ""}`}>
          <span className="input-label">LINK ORIGINAL</span>
          <input
            type="url"
            placeholder="www.exemplo.com.br"
            {...register("originalUrl")}
            disabled={isSubmitting}
          />
          {errors.originalUrl && (
            <small>
              <WarningIcon size={14} />
              {errors.originalUrl.message}
            </small>
          )}
        </label>

        <label className={`input-group${errors.slug ? " has-error" : ""}`}>
          <span className="input-label">LINK ENCURTADO</span>
          <div className="slug-input">
            <span>{shortBase}/</span>
            <input type="text" placeholder="" {...register("slug")} disabled={isSubmitting} />
          </div>
          {errors.slug && (
            <small>
              <WarningIcon size={14} />
              {errors.slug.message}
            </small>
          )}
        </label>

        {errorMessage && <p className="form-error">{errorMessage}</p>}

        <button className="primary-btn" type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? (
            <>
              <SpinnerIcon size={18} className="spin" />
              Salvando...
            </>
          ) : (
            "Salvar link"
          )}
        </button>
      </form>
    </section>
  );
}
