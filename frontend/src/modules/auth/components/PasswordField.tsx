import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

export default function PasswordField({
  password,
  showPassword,
  autoComplete,
  onChange,
  onToggle,
}: {
  password: string;
  showPassword: boolean;
  autoComplete: 'current-password' | 'new-password';
  onChange: (password: string) => void;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="password" className="text-sm font-medium">
          Senha
        </Label>
      </div>
      <div className="relative">
        <Input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder="Digite sua senha"
          value={password}
          onChange={(event) => onChange(event.target.value)}
          required
          className="h-10 bg-background pr-11"
        />
        <Button
          type="button"
          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={showPassword}
          onClick={onToggle}
          variant="ghost"
          className="absolute inset-y-0 right-0 h-full w-10 text-muted-foreground hover:text-foreground"
        >
          {showPassword ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    </div>
  );
}
