import { Link } from 'react-router';
import { Eye, Pencil, Search, Trash2 } from 'lucide-react';
import type { ProdutoQuimico } from '@/modules/produtoQuimico/models/produtoQuimico';
import DataTable, {
  type DataTableColumn,
} from '@/shared/components/data-display/DataTable';
import ConfirmDialog from '@/shared/components/feedback/ConfirmDialog';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

interface ProdutoQuimicoTableProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  deleting: boolean;
  products: ProdutoQuimico[];
  totalProducts: number;
  search: string;
  onSearchChange: (value: string) => void;
  productToDelete: ProdutoQuimico | null;
  onDeleteRequest: (product: ProdutoQuimico) => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
}

function ProdutoQuimicoTable({
  deleting,
  statusFilter,
  onStatusFilterChange,
  products,
  totalProducts,
  search,
  onSearchChange,
  productToDelete,
  onDeleteRequest,
  onDeleteCancel,
  onDeleteConfirm,
}: ProdutoQuimicoTableProps) {
  const columns: DataTableColumn<ProdutoQuimico>[] = [
    {
      key: 'nome',
      header: 'Produto',
      render: (product) => (
        <div>
          <Link
            to={`/produtos/${product.id}`}
            className="block font-medium text-primary hover:underline"
          >
            {product.nome}
          </Link>
          {product.descricao && (
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {product.descricao}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'classeRisco',
      header: 'Classe de risco ONU',
      render: (product) => `Classe ${product.classeRisco}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (product) => (
        <Badge
          variant="outline"
          className={
            product.status
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-border bg-muted text-muted-foreground'
          }
        >
          <span
            className="size-1.5 rounded-full bg-current"
            aria-hidden="true"
          />
          {product.status ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'text-right',
      render: (product) => (
        <div className="flex justify-end gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            aria-label={`Visualizar ${product.nome}`}
          >
            <Link to={`/produtos/${product.id}`}>
              <Eye aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            aria-label={`Editar ${product.nome}`}
          >
            <Link to={`/produtos/${product.id}/editar`}>
              <Pencil aria-hidden="true" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Excluir ${product.nome}`}
            onClick={() => onDeleteRequest(product)}
          >
            <Trash2 className="text-destructive" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        title="Produtos cadastrados"
        description="Consulte e gerencie os produtos químicos do terminal."
        rows={products}
        columns={columns}
        getRowKey={(product) => product.id}
        minWidth="680px"
        emptyMessage={
          totalProducts === 0
            ? 'Nenhum produto cadastrado. Use “Novo produto” para começar.'
            : 'Nenhum produto corresponde aos filtros selecionados.'
        }
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative sm:w-72">
              <Search
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                aria-label="Buscar produtos"
                placeholder="Buscar por nome ou classe..."
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                className="h-9 bg-background pl-9"
              />
            </div>
            <select
              aria-label="Filtrar por status"
              value={statusFilter}
              onChange={(event) => onStatusFilterChange(event.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        }
        footer={
          <span>
            Exibindo {products.length} de {totalProducts} produtos
          </span>
        }
      />
      <ConfirmDialog
        open={productToDelete !== null}
        title="Excluir produto químico?"
        description={`O produto ${productToDelete?.nome ?? ''} será removido da lista. Esta ação não pode ser desfeita.`}
        pending={deleting}
        confirmLabel={deleting ? 'Excluindo...' : 'Excluir produto'}
        onOpenChange={(open) => {
          if (!open) onDeleteCancel();
        }}
        onConfirm={onDeleteConfirm}
      />
    </>
  );
}

export default ProdutoQuimicoTable;
