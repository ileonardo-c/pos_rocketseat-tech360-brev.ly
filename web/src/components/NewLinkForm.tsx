import { zodResolver } from "@hookform/resolvers/zod";
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
    <section className="card">
      <h2 className="card-title">Novo Link</h2>

      <form className="form-stack" onSubmit={handleSubmit(onSubmit)}>
        <label className="field">
          <span>URL original</span>
          <input
            type="url"
            placeholder="https://www.exemplo.com"
            {...register("originalUrl")}
            disabled={isSubmitting}
          />
          {errors.originalUrl && <small>{errors.originalUrl.message}</small>}
        </label>

        <label className="field">
          <span>URL encurtada</span>
          <div className="prefix-input">
            <span>{import.meta.env.VITE_SHORT_BASE_URL ?? "brev.ly"}/</span>
            <input type="text" placeholder="meu-link" {...register("slug")} disabled={isSubmitting} />
          </div>
          {errors.slug && <small>{errors.slug.message}</small>}
        </label>

        {errorMessage && <p className="form-error">{errorMessage}</p>}

        <button type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar link"}
        </button>
      </form>
    </section>
  );
}
