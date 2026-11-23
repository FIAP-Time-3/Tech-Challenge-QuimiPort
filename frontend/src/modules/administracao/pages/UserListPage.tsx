import { useEffect, useState } from 'react';
import axios from 'axios';
import ConfirmButton from '@/shared/components/feedback/ConfirmButton';
import type {
  ListUserResponseDto,
  UserResponseDto,
} from '@/infrastructure/backend/dtos/user.dtos';
import { userApiRoutes } from '@/infrastructure/backend/routes/user.routes';
import DataTable, {
  type DataTableColumn,
} from '@/shared/components/data-display/DataTable';
import { Feedback, LoadingState } from '@/shared/components/feedback/Feedback';
import { Button } from '@/shared/components/ui/button';
import type { administrationSections } from '../sections';

const columns: DataTableColumn<UserResponseDto>[] = [
  { key: 'name', header: 'Nome', render: (user) => user.name },
  { key: 'email', header: 'E-mail', render: (user) => user.email },
  {
    key: 'status',
    header: 'Status',
    render: (user) => (user.status ? 'Ativo' : 'Inativo'),
  },
];

type Section = (typeof administrationSections)[number];

export default function UserListPage({ section }: { section: Section }) {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<ListUserResponseDto | null>(null);
  const [failed, setFailed] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    void userApiRoutes.findAll(section.role, { page }).then(
      ({ data }) => {
        if (active) setResult(data);
      },
      () => {
        if (active) setFailed(true);
      },
    );
    return () => {
      active = false;
    };
  }, [page, section.role]);

  function goToPage(nextPage: number) {
    setResult(null);
    setFailed(false);
    setPage(nextPage);
  }

  async function deactivateUser(user: UserResponseDto) {
    setSuccess('');
    try {
      await userApiRoutes.remove(section.role, user.id);
    } catch (error) {
      const message: unknown = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      throw new Error(
        typeof message === 'string'
          ? message
          : 'Não foi possível inativar o usuário.',
        { cause: error },
      );
    }

    setResult(
      (current) =>
        current && {
          ...current,
          data: current.data.map((item) =>
            item.id === user.id ? { ...item, status: false } : item,
          ),
        },
    );
    setSuccess(`Usuário ${user.name} inativado.`);
  }

  if (failed)
    return <Feedback>Não foi possível carregar os usuários.</Feedback>;
  if (!result) {
    return <LoadingState>Carregando usuários da página {page}...</LoadingState>;
  }

  return (
    <>
      {success && <Feedback variant="success">{success}</Feedback>}
      <DataTable
        title={section.label}
        columns={[
          ...columns,
          {
            key: 'actions',
            header: 'Ações',
            render: (user) =>
              user.status && (
                <ConfirmButton
                  variant="outline"
                  size="sm"
                  message={`Inativar a conta de “${user.name}”? O usuário perderá o acesso ao sistema.`}
                  onConfirm={() => deactivateUser(user)}
                >
                  Inativar
                </ConfirmButton>
              ),
          },
        ]}
        rows={result.data}
        getRowKey={(user) => user.id}
        minWidth="420px"
        footer={
          result.totalPages > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                Anterior
              </Button>
              <span>
                Página {page} de {result.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= result.totalPages}
                onClick={() => goToPage(page + 1)}
              >
                Próxima
              </Button>
            </>
          )
        }
      />
    </>
  );
}
